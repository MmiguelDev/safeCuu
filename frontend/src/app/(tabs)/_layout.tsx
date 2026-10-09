import { Tabs } from "expo-router";
import { Image, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Header = () => (
  <View className="h-24 flex-row items-center justify-between bg-white shadow-md mt-10">
    <View className="h-24 flex-row items-center gap-3 ml-5">
      <Image
        source={require("../../../assets/images/appIcons/safecuu-logo.png")}
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
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        header: Header,
        tabBarActiveTintColor: "#c0392b",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportes"
        options={{
          title: "Reportes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="panico"
        options={{
          title: "Botón de pánico",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View
              className="items-center justify-center rounded-full bg-red-600 "
              style={{ width: 56, height: 56, marginBottom: 20 }}
            >
              <Ionicons name="notifications" color="#fff" size={36} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "alert-circle" : "alert-circle-outline"} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
