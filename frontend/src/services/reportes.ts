import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { COL, db } from "./firebase";
import { prepararImagen } from "./archivos";
import { aISO } from "./usuarios";
import { prioridadDe } from "./alertas";
import { Reporte } from "../types/reporte";

export type DatosReporte = Pick<Reporte, "tipo" | "titulo" | "ubicacion" | "descripcion" | "fotos">;

/** Un documento de Firestore admite 1 MB; se deja margen para el resto de los campos. */
const MAX_BYTES_FOTOS = 850_000;

const colReportes = collection(db, COL.reportes);
const refContador = doc(db, COL.contadores, "reportes");

/** Comprime las fotos nuevas (las ya guardadas pasan tal cual) y valida el peso total. */
async function prepararFotos(fotos: string[]): Promise<string[]> {
  const listas = await Promise.all(fotos.map(prepararImagen));
  const total = listas.reduce((n, f) => n + f.length, 0);
  if (total > MAX_BYTES_FOTOS) {
    throw new Error("Las fotos pesan demasiado juntas. Quita alguna e intenta de nuevo.");
  }
  return listas;
}

/** "Mis reportes": solo los del usuario, del más nuevo al más viejo. */
export function escucharMisReportes(
  uid: string,
  onCambio: (lista: Reporte[]) => void,
  onError?: (e: Error) => void
) {
  const q = query(colReportes, where("autorId", "==", uid), orderBy("creadoEn", "desc"));
  return onSnapshot(
    q,
    (snap) =>
      onCambio(
        snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            folio: x.folio,
            titulo: x.titulo,
            tipo: x.tipo,
            descripcion: x.descripcion,
            ubicacion: x.ubicacion,
            fecha: aISO(x.creadoEn),
            estado: x.estado,
            fotos: x.fotos ?? [],
            alertaId: x.alertaId ?? null,
          };
        })
      ),
    onError
  );
}

/**
 * Crea el reporte con folio consecutivo y publica su alerta, todo en una transacción:
 * o se guardan los tres documentos o ninguno. Requiere conexión (las transacciones
 * de Firestore no funcionan sin internet).
 */
export async function crearReporte(uid: string, datos: DatosReporte): Promise<Reporte> {
  const fotos = await prepararFotos(datos.fotos);
  const refReporte = doc(colReportes);
  const refAlerta = doc(collection(db, COL.alertas));

  const folio = await runTransaction(db, async (tx) => {
    const contador = await tx.get(refContador);
    const ultimo = contador.exists() ? (contador.data()?.ultimo as number) : 0;
    const siguiente = ultimo + 1;
    const folio = String(siguiente).padStart(4, "0");

    tx.set(refContador, { ultimo: siguiente });
    tx.set(refReporte, {
      autorId: uid,
      folio,
      titulo: datos.titulo,
      tipo: datos.tipo,
      descripcion: datos.descripcion,
      ubicacion: datos.ubicacion,
      fotos,
      estado: "pendiente",
      alertaId: refAlerta.id,
      creadoEn: serverTimestamp(),
    });
    tx.set(refAlerta, {
      autorId: uid,
      titulo: datos.titulo,
      tipo: datos.tipo,
      descripcion: datos.descripcion,
      ubicacion: datos.ubicacion,
      coords: null,
      geohash: null,
      foto: fotos[0] ?? null,
      prioridad: prioridadDe(datos.tipo),
      activa: true,
      reporteId: refReporte.id,
      folio,
      creadoEn: serverTimestamp(),
    });
    return folio;
  });

  return {
    ...datos,
    fotos,
    id: refReporte.id,
    folio,
    fecha: new Date().toISOString(),
    estado: "pendiente",
    alertaId: refAlerta.id,
  };
}

/** Edita el reporte y mantiene su alerta pública con el mismo texto. */
export async function actualizarReporte(reporte: Reporte, datos: DatosReporte) {
  const fotos = await prepararFotos(datos.fotos);
  const cambios = {
    titulo: datos.titulo,
    tipo: datos.tipo,
    descripcion: datos.descripcion,
    ubicacion: datos.ubicacion,
  };
  await updateDoc(doc(colReportes, reporte.id), { ...cambios, fotos, actualizadoEn: serverTimestamp() });
  if (reporte.alertaId) {
    await updateDoc(doc(db, COL.alertas, reporte.alertaId), {
      ...cambios,
      foto: fotos[0] ?? null,
      prioridad: prioridadDe(datos.tipo),
    }).catch(() => {});
  }
}

/** Marca el reporte como resuelto y retira su alerta del feed público. */
export async function resolverReporte(reporte: Reporte) {
  await updateDoc(doc(colReportes, reporte.id), { estado: "resuelto", actualizadoEn: serverTimestamp() });
  if (reporte.alertaId) {
    await updateDoc(doc(db, COL.alertas, reporte.alertaId), { activa: false }).catch(() => {});
  }
}
