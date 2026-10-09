import { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
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

export type TipoAlerta = "animal" | "peligro";

export type AlertaConfig = {
  titulo: string;
  subtitulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  placeholderDescripcion: string;
  labelFoto: string;
};

export type AlertaData = {
  tipo: TipoAlerta;
  ubicacion: string;
  coords: { latitude: number; longitude: number } | null;
  descripcion: string;
  fotoUri: string | null;
};

type Props = {
  visible: boolean;
  tipo: TipoAlerta;
  config: AlertaConfig;
  onClose: () => void;
  onSubmit?: (data: AlertaData) => void;
};

const MAX_DESCRIPCION = 300;
const MAX_FOTO_BYTES = 10 * 1024 * 1024;

export default function AlertaFormBase({
  visible,
  tipo,
  config,
  onClose,
  onSubmit,
}: Props) {
  const cfg = config;

  const [ubicacion, setUbicacion] = useState("");
  const [coords, setCoords] = useState<AlertaData["coords"]>(null);
  const [descripcion, setDescripcion] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);

  // Limpia el formulario cada vez que se abre
  useEffect(() => {
    if (visible) {
      setUbicacion("");
      setCoords(null);
      setDescripcion("");
      setFotoUri(null);
    }
  }, [visible]);

  const formValido = ubicacion.trim().length > 0 && descripcion.trim().length > 0;

  const usarUbicacionActual = async () => {
    try {
      setCargandoUbicacion(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Activa el permiso de ubicación para usar esta opción."
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;
      const [dir] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const texto = dir
        ? [dir.street, dir.district ?? dir.subregion, dir.city]
            .filter(Boolean)
            .join(", ")
        : "";
      setUbicacion(texto || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      setCoords({ latitude, longitude });
    } catch {
      Alert.alert("Error", "No se pudo obtener tu ubicación.");
    } finally {
      setCargandoUbicacion(false);
    }
  };

  const elegirFoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_FOTO_BYTES) {
      Alert.alert("Imagen muy pesada", "El tamaño máximo es 10 MB.");
      return;
    }
    setFotoUri(asset.uri);
  };

  const enviar = () => {
    if (!formValido) return;
    onSubmit?.({
      tipo,
      ubicacion: ubicacion.trim(),
      coords,
      descripcion: descripcion.trim(),
      fotoUri,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Fondo oscuro: tocar fuera cierra */}
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-4"
          onPress={onClose}
        >
          {/* Tarjeta */}
          <Pressable
            className="bg-white w-full rounded-3xl"
            style={{ maxHeight: "90%" }}
            onPress={() => {}}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 20, gap: 16 }}
            >
              {/* Cerrar */}
              <Pressable
                onPress={onClose}
                className="absolute right-0 top-0 p-2 z-10"
              >
                <Ionicons name="close" size={22} color="#6b7280" />
              </Pressable>

              {/* Encabezado */}
              <View className="flex-row items-center gap-3 pr-8">
                <View className="bg-gray-100 p-3 rounded-full">
                  <Ionicons name={cfg.icono} size={36} color="black" />
                </View>
                <View className="flex-1">
                  <Text className="text-black font-bold text-xl">
                    {cfg.titulo}
                  </Text>
                  <Text className="text-gray-600 text-xs">{cfg.subtitulo}</Text>
                </View>
              </View>

              {/* Ubicación */}
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="location-outline" size={18} color="black" />
                  <Text className="font-bold text-black">Ubicación</Text>
                </View>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50">
                  <TextInput
                    value={ubicacion}
                    onChangeText={(t) => {
                      setUbicacion(t);
                      setCoords(null); // si edita a mano, las coords ya no aplican
                    }}
                    placeholder="Chihuahua, Chihuahua"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 h-11 text-black"
                  />
                  <Ionicons name="locate-outline" size={20} color="#6b7280" />
                </View>
                <Pressable
                  onPress={usarUbicacionActual}
                  disabled={cargandoUbicacion}
                  className="flex-row items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                >
                  {cargandoUbicacion ? (
                    <ActivityIndicator size="small" color="black" />
                  ) : (
                    <Ionicons name="location" size={16} color="black" />
                  )}
                  <Text className="text-black text-sm">
                    Usar mi ubicación actual
                  </Text>
                </Pressable>
              </View>

              {/* Descripción */}
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="black"
                  />
                  <Text className="font-bold text-black">Descripción</Text>
                </View>
                <TextInput
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder={cfg.placeholderDescripcion}
                  placeholderTextColor="#9ca3af"
                  multiline
                  maxLength={MAX_DESCRIPCION}
                  textAlignVertical="top"
                  className="h-28 border border-gray-200 rounded-xl p-3 bg-gray-50 text-black"
                />
                <Text className="text-right text-xs text-gray-400">
                  {descripcion.length}/{MAX_DESCRIPCION}
                </Text>
              </View>

              {/* Foto */}
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="camera-outline" size={18} color="black" />
                  <Text className="font-bold text-black">
                    {cfg.labelFoto}{" "}
                    <Text className="font-normal text-gray-500">
                      (opcional)
                    </Text>
                  </Text>
                </View>

                {fotoUri ? (
                  <View>
                    <Image
                      source={{ uri: fotoUri }}
                      className="w-full h-40 rounded-xl"
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={() => setFotoUri(null)}
                      className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                    >
                      <Ionicons name="close" size={18} color="white" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={elegirFoto}
                    className="items-center justify-center gap-1 py-6 border-2 border-dashed border-gray-300 rounded-xl"
                  >
                    <Ionicons name="image-outline" size={28} color="#6b7280" />
                    <Text className="text-gray-600 text-sm">
                      Toca para agregar una foto
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      JPG, PNG (máx. 10 MB)
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Enviar */}
              <Pressable
                onPress={enviar}
                disabled={!formValido}
                className={`flex-row items-center justify-center gap-2 py-4 rounded-2xl ${
                  formValido ? "bg-gray-800" : "bg-gray-400"
                }`}
              >
                <Ionicons name="send" size={18} color="white" />
                <Text className="text-white font-bold">Enviar formulario</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}