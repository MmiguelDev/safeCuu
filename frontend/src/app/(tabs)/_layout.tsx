import { useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Image, View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAvatar } from "../../components/AvatarContext";
import PanicoModal from "../../components/PanicoModal";

const Header = () => {
  const router = useRouter();
  const { avatarUri } = useAvatar();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }} className="flex-row items-center justify-between bg-white shadow-md">
      <View className="h-16 flex-row items-center gap-3 ml-5">
        <Image
          source={require("../../../assets/images/appIcons/safecuu-logo.png")}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
        <View>
          <Text className="text-2xl font-bold">Safe
            <Text className="text-2xl font-bold text-gray-600">Cuu</Text>
          </Text>
          <Text className="text-sm text-gray-600 font-semibold">Tu ciudad segura</Text>
        </View>
      </View>
      <Pressable
        className="mr-5"
        onPress={() => router.push("/informacion-personal")}
        accessibilityRole="button"
        accessibilityLabel="Abrir información personal"
      >
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            className="h-11 w-11 rounded-full"
            accessibilityLabel="Foto de perfil"
          />
        ) : (
          <View className="h-11 w-11 items-center justify-center rounded-full border-2 border-[#E7E5E4]">
            <Ionicons name="person-outline" size={24} color="#1C1917" />
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default function TabLayout() {
  const [panicoVisible, setPanicoVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          header: () => <Header />,
          tabBarActiveTintColor: "#c0392b",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} color={color as string} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="reportes"
          options={{
            title: "Reportes",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "document-text" : "document-text-outline"} color={color as string} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="panico"
          options={{
            title: "",
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <View
                className="items-center justify-center rounded-full bg-[#B84A4A]"
                style={{ width: 56, height: 56, marginBottom: 20 }}
              >
                <Ionicons name="warning-outline" color="#fff" size={30} />
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setPanicoVisible(true);
            },
          }}
        />
        <Tabs.Screen
          name="alertas"
          options={{
            title: "Alertas",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "alert-circle" : "alert-circle-outline"} color={color as string} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "person" : "person-outline"} color={color as string} size={24} />
            ),
          }}
        />
      </Tabs>

      <PanicoModal
        visible={panicoVisible}
        onClose={() => setPanicoVisible(false)}
        onConfirm={() => {
          setPanicoVisible(false);
          // TODO: conectar con backend
        }}
      />
    </>
  );
}
