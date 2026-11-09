import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "@react-native-firebase/auth";
import { auth } from "../services/firebase";
import { actualizarPerfil, crearPerfil, escucharPerfil, type CambiosPerfil } from "../services/usuarios";
import { guardarContacto, nuevoIdContacto } from "../services/contactos";
import { TipoSangre, Usuario } from "../types/usuario";

/**
 * Autenticación con Firebase por correo y contraseña (gratis y sin límite,
 * a diferencia del SMS, que exige facturación).
 *
 * Estados posibles:
 * - sin sesión:                    usuarioAuth = null                → pantallas (auth)
 * - cuenta creada pero sin perfil: usuarioAuth != null, usuario=null → /registro
 * - con perfil:                    usuario != null                   → app
 */

export const normalizarTelefono = (t: string) => t.replace(/\D/g, "").slice(-10);
export const normalizarCorreo = (c: string) => c.trim().toLowerCase();

export type DatosRegistro = {
  nombre: string;
  telefono: string;
  tipoSangre: TipoSangre | null;
  foto: string | null;
  contactoEmergencia: { nombre: string; telefono: string } | null;
};

type AuthContextValue = {
  /** Perfil completo (usuarios/{uid}). null si no hay sesión o falta registrarse. */
  usuario: Usuario | null;
  /** true si hay sesión en Firebase Auth (aunque falte el perfil). */
  sesionActiva: boolean;
  /** Correo de la cuenta con sesión, para mostrarlo en el registro. */
  correoCuenta: string | null;
  cargando: boolean;
  /** Lanzan Error con mensaje en español si fallan. */
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  crearCuenta: (correo: string, contrasena: string) => Promise<void>;
  recuperarContrasena: (correo: string) => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  actualizarUsuario: (cambios: CambiosPerfil) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MENSAJES_ERROR: Record<string, string> = {
  "auth/invalid-email": "El correo no es válido.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "No hay una cuenta con ese correo.",
  "auth/user-disabled": "Esta cuenta está desactivada.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Inicia sesión.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
  "auth/network-request-failed": "Sin conexión a internet. Revisa tu red.",
};

function errorEnEspanol(e: unknown, porDefecto: string): Error {
  const codigo = (e as { code?: string })?.code;
  return new Error((codigo && MENSAJES_ERROR[codigo]) || porDefecto);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // undefined = Firebase aún no dice si hay sesión guardada.
  const [usuarioAuth, setUsuarioAuth] = useState<User | null | undefined>(undefined);
  // El perfil se guarda con el uid al que pertenece para no mostrar el de otra sesión.
  const [perfil, setPerfil] = useState<{ uid: string; datos: Usuario | null } | null>(null);

  // 1) Sesión de Firebase Auth (persiste sola entre aperturas de la app).
  useEffect(() => onAuthStateChanged(auth, setUsuarioAuth), []);

  // 2) Perfil en Firestore del usuario autenticado.
  const uid = usuarioAuth?.uid;
  useEffect(() => {
    if (!uid) return;
    return escucharPerfil(
      uid,
      (datos) => setPerfil({ uid, datos }),
      () => setPerfil({ uid, datos: null })
    );
  }, [uid]);

  const perfilVigente = uid && perfil?.uid === uid;
  const usuario = perfilVigente ? perfil.datos : null;
  const cargando = usuarioAuth === undefined || (!!uid && !perfilVigente);

  const iniciarSesion = useCallback(async (correo: string, contrasena: string) => {
    try {
      await signInWithEmailAndPassword(auth, normalizarCorreo(correo), contrasena);
    } catch (e) {
      throw errorEnEspanol(e, "No se pudo iniciar sesión. Intenta de nuevo.");
    }
  }, []);

  const crearCuenta = useCallback(async (correo: string, contrasena: string) => {
    try {
      // Al crearla ya hay sesión; el layout lleva a /registro para completar el perfil.
      await createUserWithEmailAndPassword(auth, normalizarCorreo(correo), contrasena);
    } catch (e) {
      throw errorEnEspanol(e, "No se pudo crear la cuenta. Intenta de nuevo.");
    }
  }, []);

  const recuperarContrasena = useCallback(async (correo: string) => {
    try {
      await sendPasswordResetEmail(auth, normalizarCorreo(correo));
    } catch (e) {
      throw errorEnEspanol(e, "No se pudo enviar el correo. Intenta de nuevo.");
    }
  }, []);

  const registrar = useCallback(
    async (datos: DatosRegistro) => {
      if (!usuarioAuth) throw new Error("Primero inicia sesión.");
      await crearPerfil(usuarioAuth.uid, {
        telefono: normalizarTelefono(datos.telefono),
        nombre: datos.nombre.trim(),
        correo: usuarioAuth.email ?? "",
        tipoSangre: datos.tipoSangre,
        foto: datos.foto,
      });
      if (datos.contactoEmergencia) {
        const { nombre, telefono: tel } = datos.contactoEmergencia;
        await guardarContacto(
          usuarioAuth.uid,
          { id: nuevoIdContacto(usuarioAuth.uid), nombre, telefono: tel, relacion: "" },
          true
        ).catch(() => {});
      }
      // escucharPerfil detecta el documento nuevo y el layout lleva a la app.
    },
    [usuarioAuth]
  );

  const cerrarSesion = useCallback(async () => {
    await signOut(auth);
  }, []);

  const actualizarUsuario = useCallback(
    async (cambios: CambiosPerfil) => {
      if (!usuario) return;
      // Optimista; el snapshot de Firestore confirma después.
      setPerfil({ uid: usuario.uid, datos: { ...usuario, ...cambios } });
      await actualizarPerfil(usuario.uid, cambios);
    },
    [usuario]
  );

  const correoCuenta = usuarioAuth?.email ?? null;

  const value = useMemo(
    () => ({
      usuario,
      sesionActiva: !!usuarioAuth,
      correoCuenta,
      cargando,
      iniciarSesion,
      crearCuenta,
      recuperarContrasena,
      registrar,
      cerrarSesion,
      actualizarUsuario,
    }),
    [usuario, usuarioAuth, correoCuenta, cargando, iniciarSesion, crearCuenta, recuperarContrasena, registrar, cerrarSesion, actualizarUsuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
