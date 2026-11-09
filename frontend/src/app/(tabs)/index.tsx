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
    const { coords } = await Location.getCurrentPositionAsync({});
    mapa.current?.mostrarUbicacion(coords);
  }, []);

  useEffect(() => {
    centrarEnMi().catch(() => {});
  }, [centrarEnMi]);

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
                className="w-9/12 h-12 bg-white rounded-2xl px-4 text-black shadow-xl m-5"
              />
              <Pressable className="bg-white p-2 rounded-full hover:bg-gray-200">
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