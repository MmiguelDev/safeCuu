import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";

/**
 * Punto único de acceso a Firebase. La configuración del proyecto la leen los
 * módulos nativos de google-services.json (Android) y GoogleService-Info.plist (iOS).
 *
 * Firestore guarda caché offline por defecto: lo ya leído (p. ej. contactos de
 * emergencia) sigue disponible sin internet y las escrituras se sincronizan después.
 */
export const auth = getAuth();
export const db = getFirestore();

/** Nombres de colecciones en un solo lugar para no escribir strings sueltos. */
export const COL = {
  usuarios: "usuarios",
  contactos: "contactosEmergencia",
  eventosPanico: "eventosPanico",
  reportes: "reportes",
  alertas: "alertas",
  contadores: "contadores",
} as const;
