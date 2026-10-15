import { useState } from "react";
import { Image, Linking, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ESTADO_UI, TIPO_UI } from "../constants/estadoReporte";
import { Estado, Reporte } from "../types/reporte";
import { formatFecha } from "../utils/formatFecha";

type Props = {
  reporte: Reporte | null; // null = cerrado
  onCerrar: () => void;
  onEditar: () => void;
  onResolver: () => void;
};

const PASOS: { estado: Estado; label: string }[] = [
  { estado: "pendiente", label: "Enviado" },
  { estado: "en_proceso", label: "En revisión" },
  { estado: "resuelto", label: "Resuelto" },
];

function Seccion({ icono, titulo }: { icono: keyof typeof Ionicons.glyphMap; titulo: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name={icono} size={16} color="#1C1917" />
      <Text accessibilityRole="header" className="font-bold text-[#1C1917]">{titulo}</Text>
    </View>
  );
}

export default function ReporteDetalle({ reporte, onCerrar, onEditar, onResolver }: Props) {
  const { width } = useWindowDimensions();
  const [foto, setFoto] = useState(0);
  if (!reporte) return null;

  const ancho = width - 40;
  const estado = ESTADO_UI[reporte.estado];
  const tipo = TIPO_UI[reporte.tipo];
  const paso = PASOS.findIndex((p) => p.estado === reporte.estado);
  const resuelto = reporte.estado === "resuelto";
  const abrirMapa = () =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(reporte.ubicacion)}`
    );

  return (
    <Modal visible animationType="slide" onRequestClose={onCerrar}>
      <SafeAreaView className="flex-1 bg-white">
        <Pressable
          onPress={onCerrar}
          accessibilityRole="button"
          accessibilityLabel="Volver a Mis Reportes"
          className="flex-row items-center gap-1 px-4 py-3"
        >
          <Ionicons name="chevron-back" size={20} color="#57534E" />
          <Text className="text-[#57534E]">Mis Reportes</Text>
        </Pressable>

        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 14 }}>
          {/* Fotos */}
          {reporte.fotos.length > 0 ? (
            <View>
              <View className="overflow-hidden rounded-3xl">
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => setFoto(Math.round(e.nativeEvent.contentOffset.x / ancho))}
                >
                  {reporte.fotos.map((uri) => (
                    <Image key={uri} source={{ uri }} style={{ width: ancho, height: 200 }} resizeMode="cover" />
                  ))}
                </ScrollView>
              </View>
              <View className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5">
                <Text className="text-xs text-white">
                  {foto + 1}/{reporte.fotos.length}
                </Text>
              </View>
            </View>
          ) : (
            <View className="h-40 items-center justify-center rounded-3xl bg-[#F3F2F0]">
              <Ionicons name={tipo.icono} size={48} color="#A8A29E" />
            </View>
          )}

          {/* Título y estado */}
          <View className="flex-row items-start justify-between gap-2">
            <Text accessibilityRole="header" className="flex-1 text-2xl font-bold text-[#1C1917]">
              {reporte.titulo}
            </Text>
            <View className={`rounded-full px-3 py-1 ${estado.fondo}`}>
              <Text className={`text-xs font-bold ${estado.texto}`}>{estado.label}</Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-row items-center gap-1 rounded-full border border-[#B84A4A] px-3 py-1">
              <Ionicons name={tipo.icono} size={14} color="#B84A4A" />
              <Text className="text-xs text-[#B84A4A]">{tipo.label}</Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-[#F3F2F0] px-3 py-1">
              <Ionicons name="image-outline" size={14} color="#57534E" />
              <Text className="text-xs text-[#57534E]">
                {reporte.fotos.length} {reporte.fotos.length === 1 ? "foto" : "fotos"}
              </Text>
            </View>
          </View>

          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={16} color="#57534E" />
              <Text className="text-[#57534E]">{formatFecha(reporte.fecha)}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={16} color="#57534E" />
              <Text className="flex-1 text-[#57534E]">{reporte.ubicacion}</Text>
            </View>
          </View>

          {/* Descripción */}
          <Seccion icono="document-text-outline" titulo="Descripción" />
          <Text className="rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-3 text-[#57534E]">
            {reporte.descripcion}
          </Text>

          {/* Ubicación */}
          <Seccion icono="map-outline" titulo="Ubicación" />
          <Pressable
            onPress={abrirMapa}
            accessibilityRole="link"
            accessibilityLabel="Abrir en el mapa"
            className="flex-row items-center justify-between rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-3"
          >
            <Text numberOfLines={1} className="flex-1 pr-2 text-[#57534E]">{reporte.ubicacion}</Text>
            <Text className="font-bold text-[#B84A4A]">Abrir en el mapa ›</Text>
          </Pressable>

          {/* Seguimiento */}
          <Seccion icono="clipboard-outline" titulo="Seguimiento" />
          <View className="flex-row justify-between rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-3">
            {PASOS.map((p, i) => {
              const hecho = i <= paso;
              const actual = i === paso;
              return (
                <View key={p.estado} className="flex-1 items-center gap-1">
                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                      hecho ? "border-[#B84A4A] bg-[#B84A4A]" : "border-[#D6D3D1] bg-white"
                    }`}
                  >
                    {hecho && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                  <Text className={`text-xs ${actual ? "font-bold text-[#1C1917]" : "text-[#57534E]"}`}>
                    {p.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Acciones */}
          <Pressable
            onPress={onEditar}
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#3F4650] py-4 active:opacity-80"
          >
            <Ionicons name="pencil" size={18} color="white" />
            <Text className="font-bold text-white">Editar reporte</Text>
          </Pressable>
          <Pressable
            onPress={onResolver}
            disabled={resuelto}
            accessibilityRole="button"
            accessibilityState={{ disabled: resuelto }}
            className={`flex-row items-center justify-center gap-2 rounded-2xl border border-[#E7E5E4] py-4 ${
              resuelto ? "opacity-50" : "active:bg-[#FAFAF9]"
            }`}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#4F8A67" />
            <Text className="font-bold text-[#4F8A67]">
              {resuelto ? "Reporte resuelto" : "Marcar como resuelto"}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
