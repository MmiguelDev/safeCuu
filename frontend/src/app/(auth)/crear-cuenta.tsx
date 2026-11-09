import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotonPrimario, CampoTexto } from "../../components/AuthUI";
import { useAuth } from "../../components/AuthContext";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_CONTRASENA = 6;

type Errores = Partial<Record<"correo" | "contrasena" | "confirmacion", string>>;

/** Paso 1 del registro: correo y contraseña. El perfil se completa en /registro. */
export default function CrearCuenta() {
  const { crearCuenta } = useAuth();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [cargando, setCargando] = useState(false);

  const limpiar = (campo: keyof Errores) => setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));

  const continuar = async () => {
    const e: Errores = {};
    if (!CORREO_VALIDO.test(correo.trim())) e.correo = "Escribe un correo válido.";
    if (contrasena.length < MIN_CONTRASENA) e.contrasena = `Usa al menos ${MIN_CONTRASENA} caracteres.`;
    if (confirmacion !== contrasena) e.confirmacion = "Las contraseñas no coinciden.";
    setErrores(e);
    if (Object.values(e).some(Boolean)) return;

    setCargando(true);
    try {
      await crearCuenta(correo, contrasena);
      // Ya hay sesión: el layout raíz lleva a /registro para completar el perfil.
    } catch (err) {
      setErrores({ correo: err instanceof Error ? err.message : "No se pudo crear la cuenta." });
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-10 gap-2">
            <Text accessibilityRole="header" className="text-3xl font-bold text-[#1C1917]">
              Crea tu <Text className="text-[#B84A4A]">cuenta</Text>
            </Text>
            <Text className="text-base text-[#57534E]">
              Primero elige tu correo y una contraseña. Después completas tus datos de emergencia.
            </Text>
          </View>

          <View className="mt-8 gap-4">
            <CampoTexto
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChangeText={(v) => { setCorreo(v); limpiar("correo"); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              error={errores.correo}
            />
            <CampoTexto
              label="Contraseña"
              placeholder={`Mínimo ${MIN_CONTRASENA} caracteres`}
              value={contrasena}
              onChangeText={(v) => { setContrasena(v); limpiar("contrasena"); }}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
              autoComplete="new-password"
              error={errores.contrasena}
            />
            <CampoTexto
              label="Confirma tu contraseña"
              placeholder="Escríbela otra vez"
              value={confirmacion}
              onChangeText={(v) => { setConfirmacion(v); limpiar("confirmacion"); }}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={continuar}
              error={errores.confirmacion}
            />

            <BotonPrimario titulo="Continuar" onPress={continuar} cargando={cargando} />
          </View>

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-base text-[#57534E]">¿Ya tienes cuenta?</Text>
            <Link href="/iniciar-sesion" replace asChild>
              <Pressable accessibilityRole="link" className="py-2 active:opacity-60">
                <Text className="text-base font-bold text-[#B84A4A]">Inicia sesión</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
