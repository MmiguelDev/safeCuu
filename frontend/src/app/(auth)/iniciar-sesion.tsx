import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotonPrimario, CampoTexto } from "../../components/AuthUI";
import { useAuth } from "../../components/AuthContext";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IniciarSesion() {
  const { iniciarSesion, recuperarContrasena } = useAuth();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    if (!CORREO_VALIDO.test(correo.trim())) {
      setError("Escribe un correo válido.");
      return;
    }
    if (!contrasena) {
      setError("Escribe tu contraseña.");
      return;
    }
    setError(null);
    setCargando(true);
    try {
      await iniciarSesion(correo, contrasena);
      // El layout raíz lleva a la app (o a completar el perfil) al haber sesión.
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  const olvideContrasena = async () => {
    if (!CORREO_VALIDO.test(correo.trim())) {
      setError("Escribe tu correo arriba y vuelve a tocar \"¿Olvidaste tu contraseña?\".");
      return;
    }
    try {
      await recuperarContrasena(correo);
      Alert.alert("Revisa tu correo", "Te enviamos un enlace para crear una contraseña nueva.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar el correo.");
    }
  };

  const limpiar = () => error && setError(null);

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
              Entra con tu correo y contraseña.
            </Text>
          </View>

          <View className="mt-8 gap-4">
            <CampoTexto
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChangeText={(v) => { setCorreo(v); limpiar(); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
            />
            <CampoTexto
              label="Contraseña"
              placeholder="Tu contraseña"
              value={contrasena}
              onChangeText={(v) => { setContrasena(v); limpiar(); }}
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
              autoComplete="current-password"
              returnKeyType="done"
              onSubmitEditing={entrar}
              error={error}
            />

            <Pressable onPress={olvideContrasena} accessibilityRole="button" className="self-end py-1 active:opacity-60">
              <Text className="text-sm font-semibold text-[#B84A4A]">¿Olvidaste tu contraseña?</Text>
            </Pressable>

            <BotonPrimario titulo="Entrar" onPress={entrar} cargando={cargando} />
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-base text-[#57534E]">¿No tienes cuenta?</Text>
            <Link href="/crear-cuenta" replace asChild>
              <Pressable accessibilityRole="link" className="py-2 active:opacity-60">
                <Text className="text-base font-bold text-[#B84A4A]">Crea una</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
