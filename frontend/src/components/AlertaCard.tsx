import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TIPO_UI } from "../constants/estadoReporte";
import { Alerta, Prioridad } from "../types/alerta";
import { formatFecha } from "../utils/formatFecha";

const PRIORIDAD_UI: Record<Prioridad, { label: string; fondo: string; texto: string }> = {
  alta:  { label: "Urgente", fondo: "bg-[#F6E3E1]", texto: "text-[#B84A4A]" },
  media: { label: "Media",   fondo: "bg-[#F5ECD6]", texto: "text-[#A16F1D]" },
  baja:  { label: "Baja",    fondo: "bg-[#F3F2F0]", texto: "text-[#A8A29E]" },
};

type Props = { alerta: Alerta; onPress: () => void };

export default function AlertaCard({ alerta, onPress }: Props) {
  const tipo = TIPO_UI[alerta.tipo];
  const prio = PRIORIDAD_UI[alerta.prioridad];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${alerta.titulo}, prioridad ${prio.label}. Ver detalles`}
      className="flex-row gap-3 rounded-[20px] border border-[#E7E5E4] bg-white p-3 active:bg-[#FAFAF9]"
    >
      <View className="h-24 w-24 items-center justify-center rounded-2xl bg-[#F3F2F0]">
        <Ionicons name={tipo.icono} size={32} color="#A8A29E" />
      </View>

      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text numberOfLines={2} className="flex-1 text-base font-bold text-[#1C1917]">
            {alerta.titulo}
          </Text>
          <View className={`rounded-full px-3 py-1 ${prio.fondo}`}>
            <Text className={`text-xs font-bold ${prio.texto}`}>{prio.label}</Text>
          </View>
        </View>

        {alerta.tipo === "peligro" && (
          <View className="flex-row items-center gap-1 self-start rounded-md border border-[#B84A4A] bg-[#FAFAF9] px-2 py-0.5">
            <Ionicons name="warning-outline" size={12} color="#B84A4A" />
            <Text className="text-xs text-[#B84A4A]">Peligro</Text>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={14} color="#57534E" />
          <Text className="text-sm text-[#57534E]">{formatFecha(alerta.fecha)}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons name="location-outline" size={14} color="#57534E" />
          <Text numberOfLines={1} className="flex-1 text-sm text-[#57534E]">
            {alerta.ubicacion}
          </Text>
        </View>

        <View className="mt-1 flex-row items-center justify-end">
          <View className="rounded-xl bg-[#F6E3E1] px-4 py-2">
            <Text className="text-sm font-bold text-[#B84A4A]">Ver detalles</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
