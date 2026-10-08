import { Text, View, ImageBackground, TextInput, Pressable } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  return (
    <SafeAreaProvider >
      <View className="flex-1">
        <ImageBackground
          source={require("frontend/assets/images/appSource/mapa-chihuahua.png")}
          resizeMode="cover"
          className="flex-1"
        >
          <View className="flex-1 items-center m-5 ">
            <View className="flex-row items-center justify-center w-full">
              <TextInput
                editable
                placeholder="Buscar"
                className="w-9/12 h-12 bg-white rounded-2xl px-4 text-black shadow-xl m-5"
              />
              <Pressable className="bg-white p-2 rounded-full hover:bg-gray-200">
                <Ionicons name="search" size={30} classname="text-black font-bold" />
              </Pressable>
            </View>

          </View>
        </ImageBackground>
      </View>
    </SafeAreaProvider>
  );
}

