import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ESTADO_UI, TIPO_UI } from "../constants/estadoReporte";
import { Reporte } from "../types/reporte";
import { formatFecha } from "../utils/formatFecha";

type Props = { reporte: Reporte; onPress: () => void };

export default function ReporteCard({ reporte, onPress }: Props) {
  const estado = ESTADO_UI[reporte.estado];
  const n = reporte.fotos.length;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${reporte.titulo}, ${estado.label}. Ver detalles`}
      className="flex-row gap-3 rounded-[20px] border border-[#E7E5E4] bg-white p-3 active:bg-[#FAFAF9]"
    >
      <View className="items-center gap-1">
        {n > 0 ? (
          <Image source={{ uri: reporte.fotos[0] }} className="h-24 w-24 rounded-2xl" />
        ) : (
          <View className="h-24 w-24 items-center justify-center rounded-2xl bg-[#F3F2F0]">
            <Ionicons name={TIPO_UI[reporte.tipo].icono} size={32} color="#A8A29E" />
          </View>
        )}
        <View className="flex-row items-center gap-1">
          <Ionicons name="image-outline" size={14} color="#57534E" />
          <Text className="text-xs text-[#57534E]">
            {n} {n === 1 ? "foto" : "fotos"}
          </Text>
        </View>
      </View>

      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text numberOfLines={1} className="flex-1 text-base font-bold text-[#1C1917]">
            {reporte.titulo}
          </Text>
          <View className={`rounded-full px-3 py-1 ${estado.fondo}`}>
            <Text className={`text-xs font-bold ${estado.texto}`}>{estado.label}</Text>
          </View>
        </View>

        {reporte.tipo === "peligro" && (
          <View className="flex-row items-center gap-1 self-start rounded-md border border-[#B84A4A] bg-[#FAFAF9] px-2 py-0.5">
            <Ionicons name="warning-outline" size={12} color="#B84A4A" />
            <Text className="text-xs text-[#B84A4A]">Peligro</Text>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={14} color="#57534E" />
          <Text className="text-sm text-[#57534E]">{formatFecha(reporte.fecha)}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons name="location-outline" size={14} color="#57534E" />
          <Text numberOfLines={1} className="flex-1 text-sm text-[#57534E]">
            {reporte.ubicacion}
          </Text>
        </View>
        <Text numberOfLines={2} className="text-sm text-[#57534E]">
          {reporte.descripcion}
        </Text>

        <View className="mt-1 flex-row items-center justify-between">
          <Ionicons name="chevron-forward" size={18} color="#A8A29E" />
          <View className="rounded-xl bg-[#F6E3E1] px-4 py-2">
            <Text className="text-sm font-bold text-[#B84A4A]">Ver detalles</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
