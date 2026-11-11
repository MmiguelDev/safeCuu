import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { COL, db } from "./firebase";
import { Contacto } from "../types/contacto";

export const MAX_CONTACTOS = 5;

const colContactos = (uid: string) => collection(db, COL.usuarios, uid, COL.contactos);

/** Id nuevo generado por Firestore (sirve offline, no depende del reloj). */
export const nuevoIdContacto = (uid: string) => doc(colContactos(uid)).id;

export function escucharContactos(uid: string, onCambio: (lista: Contacto[]) => void) {
  return onSnapshot(query(colContactos(uid), orderBy("creadoEn", "asc")), (snap) => {
    onCambio(
      snap.docs.map((d) => {
        const x = d.data();
        return { id: d.id, nombre: x.nombre, telefono: x.telefono, relacion: x.relacion ?? "" };
      })
    );
  });
}

/** Crea o reemplaza un contacto. `esNuevo` evita pisar la fecha de creación al editar. */
export async function guardarContacto(uid: string, c: Contacto, esNuevo: boolean) {
  const datos = { nombre: c.nombre, telefono: c.telefono, relacion: c.relacion ?? "" };
  await setDoc(
    doc(colContactos(uid), c.id),
    esNuevo ? { ...datos, creadoEn: serverTimestamp() } : datos,
    { merge: true }
  );
}

export async function eliminarContacto(uid: string, id: string) {
  await deleteDoc(doc(colContactos(uid), id));
}
