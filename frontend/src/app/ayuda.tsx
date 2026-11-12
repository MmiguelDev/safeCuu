import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TELEFONO_SOPORTE = "6143633515";

const EQUIPO = [
  "Jesus Castellanos",
  "Miguel Duran",
  "Axel Lares",
  "Adrian Robles",
  "Christian",
];

const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function Ayuda() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 20, gap: 28, paddingBottom: 40 }}
    >
      {/* Título */}
      <View>
        <Text accessibilityRole="header" className="text-3xl font-bold text-[#1C1917]">
          <Text className="text-[#B84A4A]">Ayuda</Text> y soporte
        </Text>
        <Text className="text-[#57534E]">¿Tienes un problema con la app? Estamos para ayudarte.</Text>
      </View>

      {/* Contacto */}
      <Pressable
        onPress={() => Linking.openURL(`tel:${TELEFONO_SOPORTE}`).catch(() => {})}
        accessibilityRole="button"
        accessibilityLabel={`Llamar a soporte al ${TELEFONO_SOPORTE}`}
        className="flex-row items-center gap-4 rounded-2xl border border-[#F6C8C8] bg-[#FEF2F2] p-4 active:opacity-70"
      >
        <View className="rounded-full bg-[#B84A4A] p-3">
          <Ionicons name="call" size={22} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-[#1C1917]">Comunícate con soporte</Text>
          <Text className="text-[#57534E]">614 363 3515</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#B84A4A" />
      </Pressable>

      {/* Equipo */}
      <View className="gap-3">
        <Text className="text-xs font-bold uppercase tracking-widest text-[#57534E]">
          Desarrollada por
        </Text>
        <View className="overflow-hidden rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9]">
          {EQUIPO.map((nombre, i) => (
            <View
              key={nombre}
              className={`flex-row items-center gap-4 px-4 py-3 ${
                i < EQUIPO.length - 1 ? "border-b border-[#E7E5E4]" : ""
              }`}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F3F2F0]">
                <Text className="font-bold text-[#B84A4A]">{iniciales(nombre)}</Text>
              </View>
              <Text className="flex-1 text-base font-medium text-[#1C1917]">{nombre}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Pie */}
      <View className="items-center gap-1">
        <Text className="text-lg font-bold text-[#1C1917]">
          Safe<Text className="text-gray-600">Cuu</Text>
        </Text>
        <Text className="text-sm text-[#57534E]">Tu ciudad segura · Chihuahua</Text>
      </View>
    </ScrollView>
  );
}
