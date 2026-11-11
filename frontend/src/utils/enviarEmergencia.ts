import * as SMS from "expo-sms";
import * as Location from "expo-location";
import { AppState, Linking } from "react-native";
import { Contacto } from "../types/contacto";

/**
 * - enviado:       iOS confirmó el envío.
 * - sin_confirmar: se abrió WhatsApp o Mensajes, pero el sistema no informa si se envió.
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

const crearMensaje = (ubicacion: string) =>
  `🚨 ALERTA DE EMERGENCIA\n` +
  `Necesito ayuda urgente. Esta es mi ubicación:\n${ubicacion}\n\n` +
  `— Enviado desde SafeCuu`;

/** WhatsApp necesita el número internacional sin "+". Por defecto México (52). */
export function telefonoWhatsApp(telefono: string): string {
  const d = telefono.replace(/\D/g, "");
  if (d.length === 10) return `52${d}`;
  return d;
}

/**
 * Espera a que el usuario salga de la app (a WhatsApp) y vuelva.
 * Devuelve false si la app nunca salió (WhatsApp no se abrió).
 */
function esperarRegresoALaApp(): Promise<boolean> {
  return new Promise((resolve) => {
    let salio = false;
    let terminado = false;
    const terminar = (ok: boolean) => {
      if (terminado) return;
      terminado = true;
      sub.remove();
      clearTimeout(tSalida);
      clearTimeout(tMaximo);
      resolve(ok);
    };
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado !== "active") salio = true;
      else if (salio) terminar(true);
    });
    // Si en 4 s la app no pasó a segundo plano, WhatsApp no se abrió.
    const tSalida = setTimeout(() => { if (!salio) terminar(false); }, 4000);
    // Límite de seguridad para no quedar colgados.
    const tMaximo = setTimeout(() => terminar(salio), 5 * 60 * 1000);
  });
}

async function abrirWhatsApp(telefono: string, mensaje: string): Promise<boolean> {
  const url = `whatsapp://send?phone=${telefonoWhatsApp(telefono)}&text=${encodeURIComponent(mensaje)}`;
  try {
    const regreso = esperarRegresoALaApp();
    await Linking.openURL(url);
    return await regreso;
  } catch {
    return false; // WhatsApp no instalado
  }
}

async function enviarPorSMS(
  contactos: Contacto[],
  mensaje: string,
  onEstado: (id: string, estado: EstadoEnvio) => void
) {
  const marcar = (estado: EstadoEnvio) => contactos.forEach((c) => onEstado(c.id, estado));
  if (contactos.length === 0) return;

  let disponible = false;
  try {
    disponible = await SMS.isAvailableAsync();
  } catch {
    disponible = false;
  }
  if (!disponible) {
    marcar("error");
    return;
  }

  marcar("enviando");
  try {
    const { result } = await SMS.sendSMSAsync(contactos.map((c) => c.telefono), mensaje);
    marcar(result === "sent" ? "enviado" : result === "cancelled" ? "cancelado" : "sin_confirmar");
  } catch {
    marcar("error");
  }
}


export async function enviarAlertaEmergencia(
  contactos: Contacto[],
  ubicacion: string,
  onEstado: (id: string, estado: EstadoEnvio) => void
): Promise<{ canal: "whatsapp" | "sms" }> {
  const mensaje = crearMensaje(ubicacion);
  onEstado("policia", "enviando");

  let canal: "whatsapp" | "sms" = "whatsapp";
  for (let i = 0; i < contactos.length; i++) {
    const c = contactos[i];
    onEstado(c.id, "enviando");
    const ok = await abrirWhatsApp(c.telefono, mensaje);
    if (ok) {
      // WhatsApp no informa si el usuario presionó enviar.
      onEstado(c.id, "sin_confirmar");
      continue;
    }
    // WhatsApp no disponible: SMS para este y los que faltan.
    canal = "sms";
    await enviarPorSMS(contactos.slice(i), mensaje, onEstado);
    break;
  }

  await new Promise((r) => setTimeout(r, 800));
  onEstado("policia", "enviado");
  return { canal };
}
