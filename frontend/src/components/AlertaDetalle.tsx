import { Linking, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TIPO_UI } from "../constants/estadoReporte";
import { Alerta, Prioridad } from "../types/alerta";
import { formatFecha } from "../utils/formatFecha";

const PRIORIDAD_UI: Record<Prioridad, { label: string; fondo: string; texto: string }> = {
  alta:  { label: "Urgente", fondo: "bg-[#F6E3E1]", texto: "text-[#B84A4A]" },
  media: { label: "Media",   fondo: "bg-[#F5ECD6]", texto: "text-[#A16F1D]" },
  baja:  { label: "Baja",    fondo: "bg-[#F3F2F0]", texto: "text-[#A8A29E]" },
};

type Props = {
  alerta: Alerta | null;
  onCerrar: () => void;
};

export default function AlertaDetalle({ alerta, onCerrar }: Props) {
  if (!alerta) return null;

  const tipo = TIPO_UI[alerta.tipo];
  const prio = PRIORIDAD_UI[alerta.prioridad];

  const abrirMapa = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alerta.ubicacion)}`
    );

  return (
    <Modal visible animationType="slide" statusBarTranslucent onRequestClose={onCerrar}>
      <SafeAreaView className="flex-1 bg-white">
        <Pressable
          onPress={onCerrar}
          accessibilityRole="button"
          accessibilityLabel="Volver a Alertas"
          className="flex-row items-center gap-2 px-4 py-4 active:opacity-60"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F2F0]">
            <Ionicons name="chevron-back" size={22} color="#1C1917" />
          </View>
          <Text className="text-base font-semibold text-[#1C1917]">Alertas</Text>
        </Pressable>

        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 14 }}>
          {/* Icono grande */}
          <View className="h-40 items-center justify-center rounded-3xl bg-[#F3F2F0]">
            <Ionicons name={tipo.icono} size={56} color="#A8A29E" />
          </View>

          {/* Título y prioridad */}
          <View className="flex-row items-start justify-between gap-2">
            <Text accessibilityRole="header" className="flex-1 text-2xl font-bold text-[#1C1917]">
              {alerta.titulo}
            </Text>
            <View className={`rounded-full px-3 py-1 ${prio.fondo}`}>
              <Text className={`text-xs font-bold ${prio.texto}`}>{prio.label}</Text>
            </View>
          </View>

          {/* Tags */}
          <View className="flex-row gap-2">
            <View className="flex-row items-center gap-1 rounded-full border border-[#B84A4A] px-3 py-1">
              <Ionicons name={tipo.icono} size={14} color="#B84A4A" />
              <Text className="text-xs text-[#B84A4A]">{tipo.label}</Text>
            </View>
          </View>

          {/* Meta */}
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={16} color="#57534E" />
              <Text className="text-[#57534E]">{formatFecha(alerta.fecha)}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={16} color="#57534E" />
              <Text className="flex-1 text-[#57534E]">{alerta.ubicacion}</Text>
            </View>
          </View>

          {/* Descripción */}
          <View className="flex-row items-center gap-2">
            <Ionicons name="document-text-outline" size={16} color="#1C1917" />
            <Text accessibilityRole="header" className="font-bold text-[#1C1917]">Descripción</Text>
          </View>
          <Text className="rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-3 text-[#57534E]">
            {alerta.descripcion}
          </Text>

          {/* Reporte origen */}
          {alerta.reporteId && (
            <>
              <View className="flex-row items-center gap-2">
                <Ionicons name="link-outline" size={16} color="#1C1917" />
                <Text accessibilityRole="header" className="font-bold text-[#1C1917]">Reporte origen</Text>
              </View>
              <View className="rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-3">
                <Text className="text-sm text-[#57534E]">Folio #{alerta.reporteId}</Text>
              </View>
            </>
          )}

          {/* Ubicación */}
          <View className="flex-row items-center gap-2">
            <Ionicons name="map-outline" size={16} color="#1C1917" />
            <Text accessibilityRole="header" className="font-bold text-[#1C1917]">Ubicación</Text>
          </View>
          <Pressable
            onPress={abrirMapa}
            accessibilityRole="link"
            accessibilityLabel="Abrir en el mapa"
            className="flex-row items-center justify-between rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-3"
          >
            <Text numberOfLines={1} className="flex-1 pr-2 text-[#57534E]">{alerta.ubicacion}</Text>
            <Text className="font-bold text-[#B84A4A]">Abrir en el mapa ›</Text>
          </Pressable>

          {/* Cerrar */}
          <Pressable
            onPress={onCerrar}
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#3F4650] py-4 active:opacity-80"
          >
            <Text className="font-bold text-white">Cerrar alerta</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
