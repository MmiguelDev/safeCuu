import * as SMS from "expo-sms";
import * as Location from "expo-location";
import { Contacto } from "../types/contacto";

export type ResultadoEnvio = {
  id: string;
  nombre: string;
  estado: "enviando" | "enviado" | "error";
};

export async function obtenerUbicacion(): Promise<string> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return "Ubicación no disponible";
    const { coords } = await Location.getCurrentPositionAsync({});
    return `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
  } catch {
    return "Ubicación no disponible";
  }
}

export async function enviarSMSEmergencia(
  contactos: Contacto[],
  ubicacion: string,
  onEstado: (id: string, estado: ResultadoEnvio["estado"]) => void
): Promise<void> {
  const disponible = await SMS.isAvailableAsync();
  if (!disponible) {
    // Si SMS no está disponible, marcamos error a todos
    contactos.forEach((c) => onEstado(c.id, "error"));
    onEstado("policia", "error");
    return;
  }

  const mensaje =
    `🚨 ALERTA DE EMERGENCIA\n` +
    `Necesito ayuda urgente. Esta es mi ubicación:\n${ubicacion}\n\n` +
    `— Enviado desde SafeCuu`;

  const telefonos = contactos.map((c) => c.telefono);

  // Marcar todos como enviando
  contactos.forEach((c) => onEstado(c.id, "enviando"));
  onEstado("policia", "enviando");

  try {
    await SMS.sendSMSAsync(telefonos, mensaje);
    contactos.forEach((c) => onEstado(c.id, "enviado"));
  } catch {
    contactos.forEach((c) => onEstado(c.id, "error"));
  }

  // Policía: siempre se "notifica" (TODO: integrar con API de emergencias)
  await new Promise((r) => setTimeout(r, 800));
  onEstado("policia", "enviado");
}
