import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useAuth } from "./AuthContext";
import { escucharAlertas } from "../services/alertas";
import { estaCerca, useMiUbicacion, RADIO_KM } from "../services/cercania";

// Mostrar la notificación aunque la app esté abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Sin interfaz: escucha las alertas nuevas y lanza una notificación local cuando
 * aparece una a RADIO_KM o menos del usuario (que no haya creado él mismo).
 * Las alertas que ya existían al abrir la app no se notifican.
 */
export default function AvisoAlertasCercanas() {
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  const { yo } = useMiUbicacion();
  // La ubicación cambia seguido; se lee por ref para no reiniciar la escucha.
  const yoRef = useRef(yo);
  yoRef.current = yo;

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("alertas", {
          name: "Alertas cercanas",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
      await Notifications.requestPermissionsAsync();
    })().catch(() => {});
  }, []);

  useEffect(() => {
    if (!uid) return;
    let vistas: Set<string> | null = null;
    return escucharAlertas(uid, null, (lista) => {
      // Primera lectura: solo se registran como vistas, sin notificar.
      if (!vistas) {
        vistas = new Set(lista.map((a) => a.id));
        return;
      }
      for (const a of lista) {
        if (vistas.has(a.id)) continue;
        vistas.add(a.id);
        if (a.autorId === uid || !estaCerca(a, yoRef.current)) continue;
        Notifications.scheduleNotificationAsync({
          content: {
            title: `⚠️ ${a.titulo} a menos de ${RADIO_KM} km`,
            body: a.ubicacion || a.descripcion,
            data: { alertaId: a.id },
          },
          trigger: Platform.OS === "android" ? { channelId: "alertas" } : null,
        }).catch(() => {});
      }
    });
  }, [uid]);

  return null;
}
