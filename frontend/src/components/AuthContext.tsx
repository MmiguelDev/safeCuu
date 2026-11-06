import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Contacto } from "../types/contacto";
import { TipoSangre, Usuario } from "../types/usuario";

/**
 * Autenticación local (sin backend todavía): las cuentas viven en AsyncStorage
 * de este dispositivo. Cuando exista backend, solo este archivo debería cambiar.
 */
const KEY_USUARIOS = "safecuu:usuarios";
const KEY_SESION = "safecuu:sesion";
const KEY_CONTACTOS = "safecuu:contactos_emergencia";
const MAX_CONTACTOS = 5;

export const normalizarTelefono = (t: string) => t.replace(/\D/g, "").slice(-10);

export type DatosRegistro = {
  nombre: string;
  telefono: string;
  correo: string;
  tipoSangre: TipoSangre | null;
  foto: string | null;
  contactoEmergencia: { nombre: string; telefono: string } | null;
};

type CambiosUsuario = Partial<Pick<Usuario, "nombre" | "correo" | "tipoSangre" | "foto">>;

type AuthContextValue = {
  usuario: Usuario | null;
  cargando: boolean;
  registrar: (datos: DatosRegistro) => Promise<void>;
  /** Devuelve false si no existe una cuenta con ese número. */
  iniciarSesion: (telefono: string) => Promise<boolean>;
  cerrarSesion: () => Promise<void>;
  actualizarUsuario: (cambios: CambiosUsuario) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function leerUsuarios(): Promise<Record<string, Usuario>> {
  const v = await AsyncStorage.getItem(KEY_USUARIOS);
  return v ? JSON.parse(v) : {};
}

async function guardarUsuario(u: Usuario) {
  const usuarios = await leerUsuarios();
  usuarios[u.telefono] = u;
  await AsyncStorage.setItem(KEY_USUARIOS, JSON.stringify(usuarios));
}

async function agregarContactoEmergencia(c: { nombre: string; telefono: string }) {
  const v = await AsyncStorage.getItem(KEY_CONTACTOS);
  const lista: Contacto[] = v ? JSON.parse(v) : [];
  const yaExiste = lista.some((x) => normalizarTelefono(x.telefono) === normalizarTelefono(c.telefono));
  if (yaExiste || lista.length >= MAX_CONTACTOS) return;
  lista.push({ id: Date.now().toString(), nombre: c.nombre, telefono: c.telefono, relacion: "" });
  await AsyncStorage.setItem(KEY_CONTACTOS, JSON.stringify(lista));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sesion = await AsyncStorage.getItem(KEY_SESION);
        if (sesion) {
          const usuarios = await leerUsuarios();
          setUsuario(usuarios[sesion] ?? null);
        }
      } catch {
        // Sin sesión válida: se muestra el login
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const registrar = useCallback(async (datos: DatosRegistro) => {
    const telefono = normalizarTelefono(datos.telefono);
    const usuarios = await leerUsuarios();
    if (usuarios[telefono]) {
      throw new Error("Ya existe una cuenta con este número. Inicia sesión.");
    }
    const nuevo: Usuario = {
      telefono,
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim().toLowerCase(),
      tipoSangre: datos.tipoSangre,
      foto: datos.foto,
      creadoEn: new Date().toISOString(),
    };
    await guardarUsuario(nuevo);
    if (datos.contactoEmergencia) {
      await agregarContactoEmergencia(datos.contactoEmergencia).catch(() => {});
    }
    await AsyncStorage.setItem(KEY_SESION, telefono);
    setUsuario(nuevo);
  }, []);

  const iniciarSesion = useCallback(async (telefonoIngresado: string) => {
    const telefono = normalizarTelefono(telefonoIngresado);
    const usuarios = await leerUsuarios();
    const encontrado = usuarios[telefono];
    if (!encontrado) return false;
    await AsyncStorage.setItem(KEY_SESION, telefono);
    setUsuario(encontrado);
    return true;
  }, []);

  const cerrarSesion = useCallback(async () => {
    await AsyncStorage.removeItem(KEY_SESION);
    setUsuario(null);
  }, []);

  const actualizarUsuario = useCallback(
    async (cambios: CambiosUsuario) => {
      if (!usuario) return;
      const actualizado = { ...usuario, ...cambios };
      setUsuario(actualizado);
      await guardarUsuario(actualizado);
    },
    [usuario]
  );

  const value = useMemo(
    () => ({ usuario, cargando, registrar, iniciarSesion, cerrarSesion, actualizarUsuario }),
    [usuario, cargando, registrar, iniciarSesion, cerrarSesion, actualizarUsuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
