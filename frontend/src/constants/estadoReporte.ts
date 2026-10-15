import { Ionicons } from "@expo/vector-icons";
import { Estado, Tipo } from "../types/reporte";

// Paleta calmada de los mockups: pastel de fondo + texto apagado.
export const ESTADO_UI: Record<Estado, { label: string; fondo: string; texto: string }> = {
  pendiente: { label: "Pendiente", fondo: "bg-[#F6E3E1]", texto: "text-[#B84A4A]" },
  en_proceso: { label: "En proceso", fondo: "bg-[#F5ECD6]", texto: "text-[#A16F1D]" },
  resuelto: { label: "Resuelto", fondo: "bg-[#E4EFE8]", texto: "text-[#4F8A67]" },
};

export const TIPO_UI: Record<
  Tipo,
  { label: string; plural: string; icono: keyof typeof Ionicons.glyphMap; ayuda: string }
> = {
  perdido: { label: "Perdido", plural: "Perdidos", icono: "paw", ayuda: "Una mascota que se perdió" },
  encontrado: { label: "Encontrado", plural: "Encontrados", icono: "home-outline", ayuda: "Una mascota que encontraste" },
  peligro: { label: "Peligro", plural: "Peligros", icono: "warning-outline", ayuda: "Situaciones o zonas de riesgo en general" },
};
