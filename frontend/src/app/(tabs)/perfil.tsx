import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

const secciones = [
  {
    titulo: "CUENTA",
    opciones: [
      {
        nombre: "Información personal",
        ruta: "/informacion-personal",
      },
      {
        nombre: "Mis reportes",
        ruta: "/(tabs)/reportes",
      },
    ],
  },
  {
    titulo: "PREFERENCIAS",
    opciones: [
      {
        nombre: "Notificaciones",
        ruta: "/notificaciones",
      },
      {
        nombre: "Privacidad y seguridad",
        ruta: "/privacidad-seguridad",
      },
      {
        nombre: "Configuración",
        ruta: "/configuracion",
      },
      {
        nombre: "Ayuda",
        ruta: "/ayuda",
      },
    ],
  },
];

export default function Perfil() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="mx-auto w-full max-w-2xl px-5 pb-10 pt-6">
        <Text
          accessibilityRole="header"
          className="mb-8 text-3xl font-bold text-gray-900"
        >
          Mi perfil
        </Text>

        {secciones.map((seccion) => (
          <View key={seccion.titulo} className="mb-7">
            <View className="mb-3 flex-row items-center gap-3">
              <Text
                accessibilityRole="header"
                className="text-xs font-bold tracking-widest text-[#c0392b]"
              >
                {seccion.titulo}
              </Text>
              <View className="h-px flex-1 bg-gray-200" />
            </View>

            <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {seccion.opciones.map((opcion, indice) => (
                <Pressable
                  key={opcion.ruta}
                  accessibilityRole="button"
                  accessibilityLabel={opcion.nombre}
                  onPress={() => {
                    if (
                      opcion.ruta === "/(tabs)/reportes" ||
                      opcion.ruta === "/ayuda" ||
                      opcion.ruta === "/informacion-personal"
                    ) {
                      router.navigate(opcion.ruta);
                      return;
                    }
                    Alert.alert(
                      opcion.nombre,
                      "Esta pantalla aún no está disponible."
                    );
                  }}
                  className={`min-h-16 flex-row items-center px-5 py-4 active:bg-gray-100 ${
                    indice < seccion.opciones.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <Text className="flex-1 pr-4 text-base font-medium text-gray-800">
                    {opcion.nombre}
                  </Text>
                  <View
                    accessible={false}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    className="h-2 w-2 rotate-45 border-r-2 border-t-2 border-gray-400"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
