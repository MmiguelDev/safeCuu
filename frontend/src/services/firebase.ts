import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getApp, getApps, initializeApp } from "firebase/app";
// @ts-expect-error: getReactNativePersistence solo está en los tipos de la build de React Native.
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from "firebase/auth";
import { initializeFirestore, getFirestore, memoryLocalCache, type Firestore } from "firebase/firestore";

/**
 * Punto único de acceso a Firebase con el SDK de JavaScript (funciona en Expo Go,
 * en development builds y en el APK, sin módulos nativos).
 *
 * La configuración es pública (identifica el proyecto, no da acceso): la seguridad
 * la dan las reglas de Firestore (firestore.rules).
 */
const firebaseConfig = {
  apiKey: "AIzaSyBmNFrcsWr8dlHKzajANjtCKQchb67rr5M",
  authDomain: "safecuu-393cc.firebaseapp.com",
  projectId: "safecuu-393cc",
  storageBucket: "safecuu-393cc.firebasestorage.app",
  messagingSenderId: "99986757639",
  appId: "1:99986757639:android:b91b402f0a83b0d1ceb2a2",
};

// Con Fast Refresh este módulo se re-evalúa: reutiliza la app/instancias ya creadas.
const primeraVez = getApps().length === 0;
const app = primeraVez ? initializeApp(firebaseConfig) : getApp();

/**
 * En el celular la sesión se guarda en AsyncStorage para que persista entre aperturas.
 * En web getReactNativePersistence no existe: getAuth ya usa el almacenamiento del navegador.
 */
export const auth: Auth = Platform.OS !== "web" && primeraVez
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);

/**
 * Caché en memoria: lo leído sigue disponible mientras la app está abierta y las
 * escrituras sin internet se suben al reconectar (no sobrevive a cerrar la app).
 * experimentalForceLongPolling evita cuelgues del canal de streaming en React Native.
 */
export const db: Firestore = primeraVez
  ? initializeFirestore(app, { localCache: memoryLocalCache(), experimentalForceLongPolling: true })
  : getFirestore(app);

/** Nombres de colecciones en un solo lugar para no escribir strings sueltos. */
export const COL = {
  usuarios: "usuarios",
  contactos: "contactosEmergencia",
  eventosPanico: "eventosPanico",
  reportes: "reportes",
  alertas: "alertas",
  contadores: "contadores",
} as const;
