import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { COL, db } from "./firebase";

export type EventoPanico = {
  /** Enlace a Google Maps (o el texto de respaldo si no hubo GPS). */
  ubicacion: string;
  canal: "whatsapp" | "sms";
  /** Cuántos contactos de emergencia se intentó avisar. */
  contactos: number;
};

/**
 * Guarda el uso del botón de pánico en usuarios/{uid}/eventosPanico. Las reglas solo
 * permiten crearlo y leerlo, nunca editarlo: sirve como historial confiable.
 * Funciona sin internet (Firestore lo sube al reconectar).
 */
export async function registrarEventoPanico(uid: string, evento: EventoPanico) {
  await addDoc(collection(db, COL.usuarios, uid, COL.eventosPanico), {
    ...evento,
    creadoEn: serverTimestamp(),
  });
}
