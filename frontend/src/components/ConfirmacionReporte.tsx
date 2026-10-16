import { Image, Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ESTADO_UI, TIPO_UI } from "../constants/estadoReporte";
import { Reporte } from "../types/reporte";
import { formatFecha } from "../utils/formatFecha";

type Props = {
  reporte: Reporte | null; // null = cerrado
  onVer: () => void;
  onCerrar: () => void;
};

export default function ConfirmacionReporte({ reporte, onVer, onCerrar }: Props) {
  if (!reporte) return null;
  const estado = ESTADO_UI[reporte.estado];
  const n = reporte.fotos.length;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onCerrar}>
      <View className="flex-1 items-center justify-center bg-black/40 px-4">
        <View className="w-full gap-4 rounded-3xl bg-white p-5">
          <Pressable
            onPress={onCerrar}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            className="absolute right-3 top-3 z-10 h-9 w-9 items-center justify-center rounded-full border border-[#E7E5E4]"
          >
            <Ionicons name="close" size={18} color="#57534E" />
          </Pressable>

          <View className="items-center gap-2 pt-2">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#E4EFE8]">
              <Ionicons name="checkmark" size={32} color="#4F8A67" />
            </View>
            <Text accessibilityRole="header" className="text-2xl font-bold text-[#1C1917]">
              ¡Reporte enviado!
            </Text>
            <Text className="text-center text-[#57534E]">
              Tu reporte quedó registrado. Te avisaremos cuando cambie su estado.
            </Text>
          </View>

          <View className="flex-row gap-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-3">
            {n > 0 ? (
              <Image source={{ uri: reporte.fotos[0] }} resizeMode="cover" className="h-20 w-20 rounded-xl" />
            ) : (
              <View className="h-20 w-20 items-center justify-center rounded-xl bg-[#F3F2F0]">
                <Ionicons name={TIPO_UI[reporte.tipo].icono} size={28} color="#A8A29E" />
              </View>
            )}
            <View className="flex-1 gap-1">
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center gap-1 rounded-full bg-[#F6E3E1] px-2 py-0.5">
                  <Ionicons name={TIPO_UI[reporte.tipo].icono} size={12} color="#B84A4A" />
                  <Text className="text-xs text-[#B84A4A]">{TIPO_UI[reporte.tipo].label}</Text>
                </View>
                <View className={`rounded-full px-2 py-0.5 ${estado.fondo}`}>
                  <Text className={`text-xs ${estado.texto}`}>{estado.label}</Text>
                </View>
              </View>
              <Text numberOfLines={1} className="font-bold text-[#1C1917]">{reporte.titulo}</Text>
              <Text className="text-xs text-[#57534E]">{formatFecha(reporte.fecha)}</Text>
              <Text numberOfLines={1} className="text-xs text-[#57534E]">{reporte.ubicacion}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="information-circle-outline" size={16} color="#57534E" />
            <Text className="text-xs text-[#57534E]">
              Folio <Text className="font-bold text-[#1C1917]">#{reporte.id}</Text> · Puedes consultarlo en Mis Reportes
            </Text>
          </View>

          <Pressable
            onPress={onVer}
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#3F4650] py-4 active:opacity-80"
          >
            <Text className="font-bold text-white">Ver mi reporte</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </Pressable>
          <Pressable onPress={onCerrar} accessibilityRole="button" className="items-center py-1">
            <Text className="font-bold text-[#57534E]">Volver a Mis Reportes</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
