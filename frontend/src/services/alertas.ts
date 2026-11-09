import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";
import { geohashForLocation } from "geofire-common";
import { COL, db } from "./firebase";
import { prepararImagen } from "./archivos";
import { aISO } from "./usuarios";
import { Alerta, Prioridad } from "../types/alerta";
import { Tipo } from "../types/reporte";
import type { AlertaData } from "../components/AlertaFormBase";

/** Cuántas alertas activas se muestran en el feed (las más recientes). */
const LIMITE_FEED = 100;

export const prioridadDe = (tipo: Tipo): Prioridad => (tipo === "peligro" ? "alta" : "media");

/** Texto e información de las alertas rápidas del mapa. */
const RAPIDAS: Record<AlertaData["tipo"], { tipo: Tipo; titulo: string }> = {
  animal: { tipo: "perdido", titulo: "Animal en riesgo" },
  peligro: { tipo: "peligro", titulo: "Zona de riesgo" },
};

/**
 * Feed público de alertas activas. `leida` se calcula contra la última vez que el
 * usuario abrió la pestaña de Alertas (sus propias alertas siempre cuentan como leídas).
 */
export function escucharAlertas(
  uid: string,
  ultimaLectura: string | null,
  onCambio: (lista: Alerta[]) => void,
  onError?: (e: Error) => void
) {
  const q = query(
    collection(db, COL.alertas),
    where("activa", "==", true),
    orderBy("creadoEn", "desc"),
    limit(LIMITE_FEED)
  );
  const corte = ultimaLectura ? Date.parse(ultimaLectura) : 0;
  return onSnapshot(
    q,
    (snap) =>
      onCambio(
        snap.docs.map((d) => {
          const x = d.data();
          const fecha = aISO(x.creadoEn);
          return {
            id: d.id,
            titulo: x.titulo,
            tipo: x.tipo,
            descripcion: x.descripcion,
            ubicacion: x.ubicacion,
            fecha,
            prioridad: x.prioridad,
            reporteId: x.reporteId ?? undefined,
            folio: x.folio ?? undefined,
            foto: x.foto ?? null,
            leida: x.autorId === uid || Date.parse(fecha) <= corte,
          };
        })
      ),
    onError
  );
}

/** Publica una alerta desde los botones del mapa ("Alerta animal" / "Zona de riesgo"). */
export async function crearAlertaRapida(uid: string, datos: AlertaData) {
  const { tipo, titulo } = RAPIDAS[datos.tipo];
  const foto = datos.fotoUri ? await prepararImagen(datos.fotoUri) : null;
  const coords = datos.coords ? { lat: datos.coords.latitude, lng: datos.coords.longitude } : null;
  await setDoc(doc(collection(db, COL.alertas)), {
    autorId: uid,
    titulo,
    tipo,
    descripcion: datos.descripcion,
    ubicacion: datos.ubicacion,
    coords,
    // Para buscar "alertas cerca de ti" más adelante con geofire-common.
    geohash: coords ? geohashForLocation([coords.lat, coords.lng]) : null,
    foto,
    prioridad: prioridadDe(tipo),
    activa: true,
    creadoEn: serverTimestamp(),
  });
}

/** Guarda "ahora" como la última vez que el usuario revisó sus alertas. */
export async function marcarAlertasLeidas(uid: string) {
  await updateDoc(doc(db, COL.usuarios, uid), { ultimaLecturaAlertas: serverTimestamp() });
}
