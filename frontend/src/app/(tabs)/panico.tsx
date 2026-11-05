import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Panico() {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handlePanico = () => {
    Alert.alert(
      "¿Enviar alerta de emergencia?",
      "Se notificará a las autoridades y contactos de emergencia con tu ubicación actual.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar alerta",
          style: "destructive",
          onPress: () => {
            setEnviando(true);
            // TODO: conectar con backend
            setTimeout(() => {
              setEnviando(false);
              setEnviado(true);
              setTimeout(() => setEnviado(false), 4000);
            }, 1500);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 items-center justify-between bg-white px-6 py-12">

      {/* Info superior */}
      <View className="items-center gap-3 pt-6">
        <Text className="text-3xl font-bold text-[#1C1917]">
          Botón de <Text className="text-[#B84A4A]">Pánico</Text>
        </Text>
        <Text className="text-center text-[#57534E]">
          Presiona el botón para enviar una alerta de emergencia con tu ubicación a las autoridades.
        </Text>
      </View>

      {/* Botón central */}
      <View className="items-center gap-6">
        <Pressable
          onPress={handlePanico}
          disabled={enviando}
          accessibilityRole="button"
          accessibilityLabel="Enviar alerta de emergencia"
          style={({ pressed }) => ({ opacity: pressed || enviando ? 0.85 : 1 })}
        >
          <View
            className="items-center justify-center rounded-full bg-[#B84A4A]"
            style={{ width: 200, height: 200 }}
          >
            {enviando ? (
              <Ionicons name="radio-outline" size={72} color="white" />
            ) : (
              <Ionicons name="warning-outline" size={72} color="white" />
            )}
          </View>
        </Pressable>

        <Text className="text-base font-semibold text-[#1C1917]">
          {enviando ? "Enviando alerta..." : "Mantén presionado para activar"}
        </Text>

        {enviado && (
          <View className="flex-row items-center gap-2 rounded-2xl bg-[#E4EFE8] px-5 py-3">
            <Ionicons name="checkmark-circle-outline" size={20} color="#4F8A67" />
            <Text className="font-bold text-[#4F8A67]">Alerta enviada correctamente</Text>
          </View>
        )}
      </View>

      {/* Info inferior */}
      <View className="w-full gap-3">
        <View className="flex-row items-start gap-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-4">
          <Ionicons name="location-outline" size={20} color="#57534E" />
          <View className="flex-1">
            <Text className="font-bold text-[#1C1917]">Ubicación automática</Text>
            <Text className="text-sm text-[#57534E]">
              Tu posición GPS se adjunta automáticamente a la alerta.
            </Text>
          </View>
        </View>
        <View className="flex-row items-start gap-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-4">
          <Ionicons name="people-outline" size={20} color="#57534E" />
          <View className="flex-1">
            <Text className="font-bold text-[#1C1917]">Autoridades notificadas</Text>
            <Text className="text-sm text-[#57534E]">
              La alerta llega directamente a los servicios de emergencia de tu zona.
            </Text>
          </View>
        </View>
      </View>

    </View>
  );
}
