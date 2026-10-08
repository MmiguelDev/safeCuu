import "../../global.css";
import { Stack } from "expo-router";
import { Image, View, Text, Pressable } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => (
          <View className="h-24 flex-row items-center justify-between bg-white shadow-md mt-14">
            <View className="h-24 flex-row items-center gap-3 ml-5">
              <Image
                source={require("../../assets/images/appIcons/safecuu-logo.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />

              <View>
                <Text className="text-2xl font-bold">Safe
                  <Text className="text-2xl font-bold text-gray-600">Cuu</Text> </Text>
                <Text className="text-sm text-gray-600 font-semibold">Tu ciudad segura</Text>
              </View>
            </View>

            <Pressable className="mr-5">
              <Ionicons name="person-circle-outline" size={64} classname="text-black" />
            </Pressable>
          </View>
        ),
      }}
    />
  );
}