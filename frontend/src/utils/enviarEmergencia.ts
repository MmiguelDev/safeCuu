import * as SMS from "expo-sms";
import * as Location from "expo-location";
import { Contacto } from "../types/contacto";

/**
 * - enviado:       iOS confirmó el envío.
 * - sin_confirmar: se abrió la app de Mensajes pero el sistema no informa si se envió (siempre en Android).
 * - cancelado:     el usuario cerró el compositor sin enviar.
 * - error:         SMS no disponible o falló la llamada.
 */
export type EstadoEnvio = "enviando" | "enviado" | "sin_confirmar" | "cancelado" | "error";

export type ResultadoEnvio = {
  id: string;
  nombre: string;
  estado: EstadoEnvio;
};

const TIMEOUT_UBICACION_MS = 8000;

function conTimeout<T>(promesa: Promise<T>, ms: number): Promise<T | null> {
  let t: ReturnType<typeof setTimeout>;
  const limite = new Promise<null>((resolve) => {
    t = setTimeout(() => resolve(null), ms);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(t));
}

const enlaceMapa = (lat: number, lng: number) => `https://maps.google.com/?q=${lat},${lng}`;

export async function obtenerUbicacion(): Promise<string> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return "Ubicación no disponible";

    const actual = await conTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      TIMEOUT_UBICACION_MS
    );
    if (actual) return enlaceMapa(actual.coords.latitude, actual.coords.longitude);

    // Si el GPS no responde a tiempo, usamos la última posición conocida.
    const ultima = await Location.getLastKnownPositionAsync();
    if (ultima) return enlaceMapa(ultima.coords.latitude, ultima.coords.longitude);

    return "Ubicación no disponible";
  } catch {
    return "Ubicación no disponible";
  }
}

export async function enviarSMSEmergencia(
  contactos: Contacto[],
  ubicacion: string,
  onEstado: (id: string, estado: EstadoEnvio) => void
): Promise<void> {
  const marcarContactos = (estado: EstadoEnvio) =>
    contactos.forEach((c) => onEstado(c.id, estado));

  let disponible = false;
  try {
    disponible = await SMS.isAvailableAsync();
  } catch {
    disponible = false;
  }

  if (!disponible) {
    marcarContactos("error");
    onEstado("policia", "error");
    return;
  }

  const mensaje =
    `🚨 ALERTA DE EMERGENCIA\n` +
    `Necesito ayuda urgente. Esta es mi ubicación:\n${ubicacion}\n\n` +
    `— Enviado desde SafeCuu`;

  const telefonos = contactos.map((c) => c.telefono);

  marcarContactos("enviando");
  onEstado("policia", "enviando");

  if (telefonos.length > 0) {
    try {
      const { result } = await SMS.sendSMSAsync(telefonos, mensaje);
      marcarContactos(
        result === "sent" ? "enviado" : result === "cancelled" ? "cancelado" : "sin_confirmar"
      );
    } catch {
      marcarContactos("error");
    }
  }

  // Policía: siempre se "notifica" (TODO: integrar con API de emergencias)
  await new Promise((r) => setTimeout(r, 800));
  onEstado("policia", "enviado");
}
