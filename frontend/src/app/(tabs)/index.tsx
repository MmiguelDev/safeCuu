import { useState } from "react";
import { Text, View, ImageBackground, TextInput, Pressable } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import type { TipoAlerta, AlertaData } from "../../components/AlertaFormBase";
import AlertaAnimalModal from "../../components/AlertaAnimalModal";
import ZonaRiesgoModal from "../../components/ZonaRiesgoModal";

export default function Index() {
  const [alerta, setAlerta] = useState<TipoAlerta | null>(null);

  const guardarAlerta = (data: AlertaData) => {
    console.log("Alerta enviada:", data); // aquí conectas tu backend / AsyncStorage
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1">
        <ImageBackground
          source={require("frontend/assets/images/appSource/mapa-chihuahua.png")}
          resizeMode="cover"
          className="flex-1"
        >
          <View className="flex-1 items-center m-5 justify-between">
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
    </ImageBackground>
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