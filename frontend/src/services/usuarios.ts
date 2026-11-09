import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "@react-native-firebase/firestore";
import { COL, db } from "./firebase";
import { prepararImagen } from "./archivos";
import { Usuario } from "../types/usuario";

const refUsuario = (uid: string) => doc(db, COL.usuarios, uid);

/** Convierte Timestamp de Firestore a ISO; tolera el valor pendiente de serverTimestamp. */
export function aISO(valor: unknown): string {
  if (valor && typeof (valor as { toDate?: unknown }).toDate === "function") {
    return (valor as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof valor === "string" ? valor : new Date().toISOString();
}

/** Escucha el perfil del usuario. Llama con null si todavía no existe (falta registrarse). */
export function escucharPerfil(uid: string, onCambio: (u: Usuario | null) => void, onError?: (e: Error) => void) {
  return onSnapshot(
    refUsuario(uid),
    (snap) => {
      const d = snap.data();
      if (!d) return onCambio(null);
      onCambio({
        uid,
        telefono: d.telefono,
        nombre: d.nombre,
        correo: d.correo,
        tipoSangre: d.tipoSangre ?? null,
        foto: d.foto ?? null,
        creadoEn: aISO(d.creadoEn),
        ultimaLecturaAlertas: d.ultimaLecturaAlertas ? aISO(d.ultimaLecturaAlertas) : null,
      });
    },
    onError
  );
}

export type DatosPerfil = Pick<Usuario, "telefono" | "nombre" | "correo" | "tipoSangre" | "foto">;

export async function crearPerfil(uid: string, datos: DatosPerfil) {
  const foto = datos.foto ? await prepararImagen(datos.foto) : null;
  await setDoc(refUsuario(uid), {
    ...datos,
    foto,
    creadoEn: serverTimestamp(),
    ultimaLecturaAlertas: serverTimestamp(),
  });
}

export type CambiosPerfil = Partial<Pick<Usuario, "nombre" | "correo" | "tipoSangre" | "foto">>;

export async function actualizarPerfil(uid: string, cambios: CambiosPerfil) {
  const datos = { ...cambios };
  if (datos.foto) datos.foto = await prepararImagen(datos.foto);
  await updateDoc(refUsuario(uid), datos);
}
