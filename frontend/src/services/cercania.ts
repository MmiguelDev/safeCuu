import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { distanceBetween } from "geofire-common";

/** Radio en km dentro del cual una alerta se considera "cerca de ti". */
export const RADIO_KM = 1;

export type Punto = { lat: number; lng: number };

/** true si la alerta tiene coordenadas y está a RADIO_KM o menos del punto dado. */
export function estaCerca(alerta: { coords?: Punto | null }, yo: Punto | null) {
  if (!yo || !alerta.coords) return false;
  return distanceBetween([alerta.coords.lat, alerta.coords.lng], [yo.lat, yo.lng]) <= RADIO_KM;
}

/**
 * Ubicación actual del usuario, actualizada cada ~100 m de movimiento.
 * `null` mientras no hay permiso o aún no llega la primera lectura.
 */
export function useMiUbicacion() {
  const [yo, setYo] = useState<Punto | null>(null);
  const [sinPermiso, setSinPermiso] = useState(false);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelado = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (!cancelado) setSinPermiso(true);
        return;
      }
      const actualizar = ({ coords }: Location.LocationObject) =>
        !cancelado && setYo({ lat: coords.latitude, lng: coords.longitude });
      Location.getLastKnownPositionAsync().then((p) => p && actualizar(p)).catch(() => {});
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 100 },
        actualizar
      );
      if (cancelado) sub.remove();
    })().catch(() => {});
    return () => {
      cancelado = true;
      sub?.remove();
    };
  }, []);

  return { yo, sinPermiso };
}
