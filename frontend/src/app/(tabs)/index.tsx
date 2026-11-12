import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Text, View, TextInput, Pressable } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

import Mapa, { type MapaRef } from "../../components/Mapa";
import { useAuth } from "../../components/AuthContext";
import { crearAlertaRapida } from "../../services/alertas";

import type { TipoAlerta, AlertaData } from "../../components/AlertaFormBase";
import AlertaAnimalModal from "../../components/AlertaAnimalModal";
import ZonaRiesgoModal from "../../components/ZonaRiesgoModal";

export default function Index() {
  const [alerta, setAlerta] = useState<TipoAlerta | null>(null);
  const mapa = useRef<MapaRef>(null);
  const { usuario } = useAuth();

  const centrarEnMi = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    // La última posición conocida llega al instante; luego se afina con la actual.
    const ultima = await Location.getLastKnownPositionAsync().catch(() => null);
    if (ultima) mapa.current?.mostrarUbicacion(ultima.coords);
    const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    mapa.current?.mostrarUbicacion(coords);
  }, []);

  useEffect(() => {
    centrarEnMi().catch(() => {});
  }, [centrarEnMi]);

  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);

  /** Busca la dirección o lugar escrito (primero dentro de Chihuahua) y lo marca en el mapa. */
  const buscarLugar = async () => {
    const texto = busqueda.trim();
    if (!texto || buscando) return;
    setBuscando(true);
    try {
      let resultados = await Location.geocodeAsync(`${texto}, Chihuahua, México`);
      if (resultados.length === 0) resultados = await Location.geocodeAsync(texto);
      if (resultados.length === 0) {
        Alert.alert("Sin resultados", "No encontramos ese lugar. Prueba con calle y colonia.");
        return;
      }
      const { latitude, longitude } = resultados[0];
      mapa.current?.marcarLugar?.({ latitude, longitude }, texto);
    } catch {
      Alert.alert("No se pudo buscar", "Revisa tu conexión e intenta de nuevo.");
    } finally {
      setBuscando(false);
    }
  };

  const guardarAlerta = (data: AlertaData) => {
    if (!usuario) return;
    crearAlertaRapida(usuario.uid, data)
      .then(() => Alert.alert("Alerta publicada", "Los usuarios de tu zona ya pueden verla en Alertas."))
      .catch((e) =>
        Alert.alert("No se pudo publicar", e instanceof Error ? e.message : "Intenta de nuevo.")
      );
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1">
        {/* Chihuahua mientras llega la ubicación real */}
        <Mapa ref={mapa} inicial={{ latitude: 28.6353, longitude: -106.0889 }} zoomInicial={13} />

          <View pointerEvents="box-none" className="flex-1 items-center m-5 justify-between">
            <View className="flex-row items-center justify-center w-full">
              <TextInput
                editable
                placeholder="Buscar"
                value={busqueda}
                onChangeText={setBusqueda}
                onSubmitEditing={buscarLugar}
                returnKeyType="search"
                className="w-9/12 h-12 bg-white rounded-2xl px-4 text-black shadow-xl m-5"
              />
              <Pressable
                onPress={buscarLugar}
                disabled={buscando}
                accessibilityRole="button"
                accessibilityLabel="Buscar lugar"
                className="bg-white p-2 rounded-full hover:bg-gray-200"
              >
                <Ionicons name="search" size={30} color="black" />
              </Pressable>
            </View>

            <Pressable
              onPress={() => centrarEnMi().catch(() => {})}
              accessibilityRole="button"
              accessibilityLabel="Centrar en mi ubicación"
              className="self-end bg-white p-3 rounded-full shadow-xl active:opacity-70"
            >
              <Ionicons name="locate" size={24} color="#1A73E8" />
            </Pressable>

            <View className="flex-row items-end justify-center w-full gap-3">
              <Pressable
                onPress={() => setAlerta("animal")}
                className="flex-1 bg-white p-2 rounded-3xl hover:bg-gray-200 flex-row items-center gap-2"
              >
                <View className="bg-gray-300 p-2 rounded-full">
                  <Ionicons name="paw-outline" size={26} color="black" />
                </View>
                <Text
                  className="flex-1 text-black font-bold text-base"
                  numberOfLines={2}
                >
                  Alerta Animal
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setAlerta("peligro")}
                className="flex-1 bg-white p-2 rounded-3xl hover:bg-gray-200 flex-row items-center gap-2"
              >
                <View className="bg-gray-300 p-2 rounded-full">
                  <Ionicons name="location-outline" size={26} color="black" />
                </View>
                <Text
                  className="flex-1 text-black font-bold text-base"
                  numberOfLines={2}
                >
                  Zona de riesgo
                </Text>
              </Pressable>
            </View>
          </View>

      </View >

      <AlertaAnimalModal
        visible={alerta === "animal"}
        onClose={() => setAlerta(null)}
        onSubmit={guardarAlerta}
      />
      <ZonaRiesgoModal
        visible={alerta === "peligro"}
        onClose={() => setAlerta(null)}
        onSubmit={guardarAlerta}
      />
    </SafeAreaProvider >
  );
}