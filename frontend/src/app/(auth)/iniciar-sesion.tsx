import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotonPrimario, CampoTexto } from "../../components/AuthUI";
import { normalizarTelefono, useAuth } from "../../components/AuthContext";

export default function IniciarSesion() {
  const router = useRouter();
  const { iniciarSesion } = useAuth();
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [noExiste, setNoExiste] = useState(false);
  const [cargando, setCargando] = useState(false);

  const continuar = async () => {
    setNoExiste(false);
    if (normalizarTelefono(telefono).length < 10) {
      setError("Escribe tu número de celular a 10 dígitos.");
      return;
    }
    setError(null);
    setCargando(true);
    try {
      const ok = await iniciarSesion(telefono);
      if (!ok) {
        setNoExiste(true);
        setError("No encontramos una cuenta con este número.");
      }
      // Si ok, el layout raíz redirige automáticamente a la app.
    } catch {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const irARegistro = () =>
    router.push({ pathname: "/registro", params: { telefono: normalizarTelefono(telefono) } });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-6 items-center">
            <Image
              source={require("../../../assets/images/appIcons/safecuu-logo-512.png")}
              style={{ width: 168, height: 168 }}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="SafeCuu"
            />
            <Text className="mt-1 text-sm font-semibold text-gray-600">Tu ciudad segura</Text>
          </View>

          <View className="mt-10 items-center gap-2">
            <Text accessibilityRole="header" className="text-3xl font-bold text-[#1C1917]">
              Inicia <Text className="text-[#B84A4A]">sesión</Text>
            </Text>
            <Text className="text-center text-base text-[#57534E]">
              Ingresa el número de celular con el que te registraste.
            </Text>
          </View>

          <View className="mt-8 gap-6">
            <CampoTexto
              label="Número de celular"
              prefijo="+52"
              placeholder="614 000 0000"
              value={telefono}
              onChangeText={(v) => {
                setTelefono(v);
                if (error) setError(null);
              }}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              maxLength={14}
              returnKeyType="done"
              onSubmitEditing={continuar}
              error={error}
            />

            {noExiste && (
              <Pressable
                onPress={irARegistro}
                accessibilityRole="button"
                className="flex-row items-center gap-3 rounded-2xl border border-[#F6C8C8] bg-[#FEF2F2] p-4 active:opacity-80"
              >
                <Ionicons name="person-add-outline" size={20} color="#B84A4A" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#B84A4A]">¿Eres nuevo en SafeCuu?</Text>
                  <Text className="text-xs text-[#B84A4A]">Crea tu cuenta con este número</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#B84A4A" />
              </Pressable>
            )}

            <BotonPrimario titulo="Continuar" onPress={continuar} cargando={cargando} />
          </View>

          <View className="flex-1" />

          <View className="mt-10 flex-row items-center justify-center gap-1">
            <Text className="text-[#57534E]">¿No tienes cuenta?</Text>
            <Pressable onPress={irARegistro} accessibilityRole="link" hitSlop={8}>
              <Text className="font-bold text-[#B84A4A]">Regístrate</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
