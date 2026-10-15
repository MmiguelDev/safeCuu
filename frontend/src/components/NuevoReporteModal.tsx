import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { TIPO_UI } from "../constants/estadoReporte";
import { Reporte, Tipo } from "../types/reporte";
import { formatDia, formatHora } from "../utils/formatFecha";

export type ReporteData = Pick<Reporte, "tipo" | "titulo" | "ubicacion" | "descripcion" | "fotos">;

type Props = {
  inicial: Reporte | null; // null = reporte nuevo
  onClose: () => void;
  onGuardar: (data: ReporteData) => void;
};

const MAX_DESCRIPCION = 300;
const MAX_FOTOS = 5;
const MAX_FOTO_BYTES = 10 * 1024 * 1024;
const TIPOS: Tipo[] = ["perdido", "encontrado", "peligro"];

const campo = (error: boolean) =>
  `rounded-xl border bg-[#FAFAF9] px-3 ${error ? "border-[#B84A4A]" : "border-[#E7E5E4]"}`;

function Etiqueta({ icono, texto, extra }: { icono: keyof typeof Ionicons.glyphMap; texto: string; extra?: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name={icono} size={18} color="#1C1917" />
      <Text className="font-bold text-[#1C1917]">
        {texto} {extra ? <Text className="font-normal text-[#57534E]">{extra}</Text> : null}
      </Text>
    </View>
  );
}

function MensajeError({ ver }: { ver: boolean }) {
  return ver ? <Text className="text-xs text-[#B84A4A]">Este campo es obligatorio</Text> : null;
}

// Se monta solo mientras está abierto: el estado inicial sale de `inicial` y se descarta al cerrar.
export default function NuevoReporteModal({ inicial, onClose, onGuardar }: Props) {
  const [tipo, setTipo] = useState<Tipo>(inicial?.tipo ?? "peligro");
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [ubicacion, setUbicacion] = useState(inicial?.ubicacion ?? "");
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
  const [fotos, setFotos] = useState<string[]>(inicial?.fotos ?? []);
  const [fecha] = useState(() => inicial?.fecha ?? new Date().toISOString());
  const [intentado, setIntentado] = useState(false);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);

  const usarUbicacionActual = async () => {
    try {
      setCargandoUbicacion(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Activa el permiso de ubicación para usar esta opción.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      const [dir] = await Location.reverseGeocodeAsync(coords);
      const texto = dir
        ? [dir.street, dir.district ?? dir.subregion, dir.city].filter(Boolean).join(", ")
        : "";
      setUbicacion(texto || `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
    } catch {
      Alert.alert("Error", "No se pudo obtener tu ubicación.");
    } finally {
      setCargandoUbicacion(false);
    }
  };

  const agregarFoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_FOTO_BYTES) {
      Alert.alert("Imagen muy pesada", "El tamaño máximo es 10 MB.");
      return;
    }
    setFotos((f) => [...f, asset.uri]);
  };

  const enviar = () => {
    setIntentado(true);
    if (!titulo.trim() || !ubicacion.trim() || !descripcion.trim()) return;
    onGuardar({
      tipo,
      titulo: titulo.trim(),
      ubicacion: ubicacion.trim(),
      descripcion: descripcion.trim(),
      fotos,
    });
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <Pressable className="flex-1 items-center justify-center bg-black/40 px-4" onPress={onClose}>
          <Pressable className="w-full rounded-3xl bg-white" style={{ maxHeight: "92%" }} onPress={() => {}}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16 }}>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                className="absolute right-0 top-0 z-10 p-2"
              >
                <Ionicons name="close" size={22} color="#57534E" />
              </Pressable>

              {/* Encabezado */}
              <View className="flex-row items-center gap-3 pr-8">
                <View className="rounded-full bg-[#F3F2F0] p-3">
                  <Ionicons name="document-text-outline" size={32} color="#1C1917" />
                </View>
                <View className="flex-1">
                  <Text accessibilityRole="header" className="text-xl font-bold text-[#1C1917]">
                    {inicial ? "Editar reporte" : "Nuevo reporte"}
                  </Text>
                  <Text className="text-xs text-[#57534E]">Cuéntanos qué pasó para que podamos ayudarte</Text>
                </View>
              </View>

              {/* Tipo */}
              <View className="gap-2">
                <Etiqueta icono="pricetag-outline" texto="Tipo de reporte" />
                <View className="flex-row gap-2">
                  {TIPOS.map((t) => {
                    const activo = tipo === t;
                    return (
                      <Pressable
                        key={t}
                        onPress={() => setTipo(t)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: activo }}
                        className={`flex-1 flex-row items-center justify-center gap-1 rounded-full py-2 ${
                          activo ? "bg-[#B84A4A]" : "bg-[#F3F2F0]"
                        }`}
                      >
                        <Ionicons name={TIPO_UI[t].icono} size={14} color={activo ? "white" : "#57534E"} />
                        <Text className={`text-sm ${activo ? "font-bold text-white" : "text-[#57534E]"}`}>
                          {TIPO_UI[t].label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text className="text-xs text-[#57534E]">{TIPO_UI[tipo].ayuda}</Text>
              </View>

              {/* Título */}
              <View className="gap-2">
                <Etiqueta icono="create-outline" texto="Título" />
                <TextInput
                  value={titulo}
                  onChangeText={setTitulo}
                  placeholder="Ej. Gato perdido, Perro encontrado, Calle sin alumbrado"
                  placeholderTextColor="#A8A29E"
                  className={`${campo(intentado && !titulo.trim())} h-11 text-[#1C1917]`}
                />
                <MensajeError ver={intentado && !titulo.trim()} />
              </View>

              {/* Ubicación */}
              <View className="gap-2">
                <Etiqueta icono="location-outline" texto="Ubicación" />
                <View className={`${campo(intentado && !ubicacion.trim())} flex-row items-center`}>
                  <TextInput
                    value={ubicacion}
                    onChangeText={setUbicacion}
                    placeholder="Chihuahua, Chihuahua"
                    placeholderTextColor="#A8A29E"
                    className="h-11 flex-1 text-[#1C1917]"
                  />
                  <Ionicons name="locate-outline" size={20} color="#57534E" />
                </View>
                <MensajeError ver={intentado && !ubicacion.trim()} />
                <Pressable
                  onPress={usarUbicacionActual}
                  disabled={cargandoUbicacion}
                  accessibilityRole="button"
                  className="flex-row items-center gap-2 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] px-3 py-2"
                >
                  {cargandoUbicacion ? (
                    <ActivityIndicator size="small" color="#1C1917" />
                  ) : (
                    <Ionicons name="location" size={16} color="#B84A4A" />
                  )}
                  <Text className="text-sm text-[#1C1917]">Usar mi ubicación actual</Text>
                </Pressable>
              </View>

              {/* Fecha y hora (se toma al crear; no editable) */}
              <View className="gap-2">
                <Etiqueta icono="calendar-outline" texto="Fecha y hora" />
                <View className="flex-row gap-2">
                  <View className={`${campo(false)} h-11 flex-1 flex-row items-center gap-2`}>
                    <Ionicons name="calendar-outline" size={16} color="#57534E" />
                    <Text className="text-[#1C1917]">{formatDia(fecha)}</Text>
                  </View>
                  <View className={`${campo(false)} h-11 flex-1 flex-row items-center gap-2`}>
                    <Ionicons name="time-outline" size={16} color="#57534E" />
                    <Text className="text-[#1C1917]">{formatHora(fecha)}</Text>
                  </View>
                </View>
              </View>

              {/* Descripción */}
              <View className="gap-2">
                <Etiqueta icono="document-text-outline" texto="Descripción" />
                <TextInput
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Describe lo que pasó: qué viste, dónde y cuándo..."
                  placeholderTextColor="#A8A29E"
                  multiline
                  maxLength={MAX_DESCRIPCION}
                  textAlignVertical="top"
                  className={`${campo(intentado && !descripcion.trim())} h-28 py-3 text-[#1C1917]`}
                />
                <View className="flex-row justify-between">
                  <MensajeError ver={intentado && !descripcion.trim()} />
                  <Text className="ml-auto text-xs text-[#A8A29E]">
                    {descripcion.length}/{MAX_DESCRIPCION}
                  </Text>
                </View>
              </View>

              {/* Fotos */}
              <View className="gap-2">
                <Etiqueta icono="camera-outline" texto="Fotos" extra="(opcional)" />
                <View className="flex-row items-center gap-2">
                  {fotos.length < MAX_FOTOS && (
                    <Pressable
                      onPress={agregarFoto}
                      accessibilityRole="button"
                      accessibilityLabel="Agregar foto"
                      className="flex-1 items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#D6D3D1] py-4"
                    >
                      <Ionicons name="image-outline" size={26} color="#57534E" />
                      <Text className="text-sm text-[#57534E]">Toca para agregar fotos</Text>
                      <Text className="text-xs text-[#A8A29E]">JPG, PNG (máx. 10 MB)</Text>
                    </Pressable>
                  )}
                </View>
                {fotos.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {fotos.map((uri, i) => (
                      <View key={uri + i}>
                        <Image source={{ uri }} className="h-20 w-20 rounded-xl" />
                        <Pressable
                          onPress={() => setFotos((f) => f.filter((_, j) => j !== i))}
                          accessibilityRole="button"
                          accessibilityLabel="Quitar foto"
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1"
                        >
                          <Ionicons name="close" size={14} color="white" />
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Enviar */}
              <Pressable
                onPress={enviar}
                accessibilityRole="button"
                className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#3F4650] py-4 active:opacity-80"
              >
                <Ionicons name="send" size={18} color="white" />
                <Text className="font-bold text-white">{inicial ? "Guardar cambios" : "Enviar formulario"}</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
