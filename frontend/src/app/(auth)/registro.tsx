import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotonPrimario, CampoTexto, TituloSeccion } from "../../components/AuthUI";
import { normalizarTelefono, useAuth } from "../../components/AuthContext";
import { TIPOS_SANGRE, TipoSangre } from "../../types/usuario";
import { elegirContactoDeAgenda } from "../../utils/elegirContacto";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errores = Partial<Record<"nombre" | "telefono" | "correo" | "contactoNombre" | "contactoTelefono", string>>;

export default function Registro() {
  const router = useRouter();
  const { registrar } = useAuth();
  const params = useLocalSearchParams<{ telefono?: string }>();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState(params.telefono ?? "");
  const [correo, setCorreo] = useState("");
  const [tipoSangre, setTipoSangre] = useState<TipoSangre | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [opcionesTelefono, setOpcionesTelefono] = useState<string[]>([]);
  const [eligiendo, setEligiendo] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [cargando, setCargando] = useState(false);

  const limpiarError = (campo: keyof Errores) =>
    setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));

  const elegirFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert("Permiso necesario", "Permite el acceso a tus fotos para elegir una foto de perfil.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) setFoto(res.assets[0].uri);
  };

  const elegirContacto = async () => {
    if (eligiendo) return;
    setEligiendo(true);
    const elegido = await elegirContactoDeAgenda();
    setEligiendo(false);
    if (!elegido) return;
    setContactoNombre(elegido.nombre);
    setContactoTelefono(elegido.numeros[0]);
    setOpcionesTelefono(elegido.numeros.length > 1 ? elegido.numeros : []);
    setErrores((e) => ({ ...e, contactoNombre: undefined, contactoTelefono: undefined }));
  };

  const validar = (): Errores => {
    const e: Errores = {};
    if (!nombre.trim()) e.nombre = "Escribe tu nombre.";
    if (normalizarTelefono(telefono).length < 10) e.telefono = "Escribe tu celular a 10 dígitos.";
    if (!correo.trim()) e.correo = "Escribe tu correo electrónico.";
    else if (!CORREO_VALIDO.test(correo.trim())) e.correo = "Revisa tu correo electrónico.";

    const hayContacto = contactoNombre.trim() || contactoTelefono.trim();
    if (hayContacto) {
      if (!contactoNombre.trim()) e.contactoNombre = "Escribe el nombre del contacto.";
      if (normalizarTelefono(contactoTelefono).length < 10)
        e.contactoTelefono = "El teléfono debe tener 10 dígitos.";
      else if (normalizarTelefono(contactoTelefono) === normalizarTelefono(telefono))
        e.contactoTelefono = "Usa un número distinto al tuyo.";
    }
    return e;
  };

  const crearCuenta = async () => {
    const e = validar();
    setErrores(e);
    if (Object.values(e).some(Boolean)) return;

    setCargando(true);
    try {
      await registrar({
        nombre,
        telefono,
        correo,
        tipoSangre,
        foto,
        contactoEmergencia: contactoTelefono.trim()
          ? { nombre: contactoNombre.trim(), telefono: contactoTelefono.trim() }
          : null,
      });
      // El layout raíz redirige a la app al existir sesión.
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "No se pudo crear la cuenta.";
      if (mensaje.includes("Ya existe")) {
        setErrores((x) => ({ ...x, telefono: mensaje }));
      } else {
        Alert.alert("Error", mensaje);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/iniciar-sesion"))}
        accessibilityRole="button"
        accessibilityLabel="Volver"
        className="flex-row items-center gap-2 self-start px-4 py-4 active:opacity-60"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F2F0]">
          <Ionicons name="chevron-back" size={22} color="#1C1917" />
        </View>
        <Text className="text-base font-semibold text-[#1C1917]">Volver</Text>
      </Pressable>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text accessibilityRole="header" className="text-3xl font-bold text-[#1C1917]">
              Crea tu <Text className="text-[#B84A4A]">cuenta</Text>
            </Text>
            <Text className="mt-1 text-[#57534E]">
              Tus datos ayudan a que te encuentren rápido en una emergencia.
            </Text>
          </View>

          {/* Foto */}
          <View className="items-center gap-2">
            <Pressable
              onPress={elegirFoto}
              accessibilityRole="button"
              accessibilityLabel={foto ? "Cambiar foto de perfil" : "Agregar foto de perfil"}
              className="active:opacity-80"
            >
              {foto ? (
                <Image source={{ uri: foto }} className="h-28 w-28 rounded-full bg-[#F3F2F0]" />
              ) : (
                <View className="h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-[#E7E5E4] bg-[#FAFAF9]">
                  <Ionicons name="camera-outline" size={32} color="#57534E" />
                </View>
              )}
              <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#B84A4A]">
                <Ionicons name={foto ? "pencil" : "add"} size={18} color="white" />
              </View>
            </Pressable>
            <Text className="text-xs text-[#57534E]">
              Foto <Text className="text-[#78716C]">(opcional)</Text>
            </Text>
          </View>

          {/* Datos */}
          <TituloSeccion>TUS DATOS</TituloSeccion>
          <View className="gap-4">
            <CampoTexto
              label="Nombre completo"
              placeholder="Ej. María López"
              value={nombre}
              onChangeText={(v) => { setNombre(v); limpiarError("nombre"); }}
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
              error={errores.nombre}
            />
            <CampoTexto
              label="Número de celular"
              prefijo="+52"
              placeholder="614 000 0000"
              value={telefono}
              onChangeText={(v) => { setTelefono(v); limpiarError("telefono"); }}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              maxLength={14}
              error={errores.telefono}
            />
            <CampoTexto
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChangeText={(v) => { setCorreo(v); limpiarError("correo"); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              error={errores.correo}
            />
          </View>

          {/* Emergencia */}
          <TituloSeccion>EN CASO DE EMERGENCIA</TituloSeccion>

          <View className="gap-2">
            <Text className="text-xs font-semibold text-[#57534E]">
              Tipo de sangre <Text className="font-normal text-[#78716C]">(opcional)</Text>
            </Text>
            <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
              {TIPOS_SANGRE.map((t) => {
                const activo = tipoSangre === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTipoSangre(activo ? null : t)}
                    accessibilityRole="radio"
                    accessibilityLabel={`Tipo de sangre ${t}`}
                    accessibilityState={{ selected: activo }}
                    className={`min-w-[64px] items-center rounded-full border px-4 py-2 ${
                      activo ? "border-[#B84A4A] bg-[#FEF2F2]" : "border-[#E7E5E4] bg-white"
                    }`}
                  >
                    <Text className={`text-sm ${activo ? "font-bold text-[#B84A4A]" : "font-semibold text-[#1C1917]"}`}>
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="gap-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="people-outline" size={18} color="#57534E" />
              <Text className="flex-1 text-sm font-semibold text-[#1C1917]">
                Contacto de emergencia <Text className="font-normal text-[#78716C]">(opcional)</Text>
              </Text>
            </View>
            <Text className="text-xs text-[#57534E]">
              Recibirá tu ubicación por WhatsApp si activas el botón de pánico.
            </Text>

            <Pressable
              onPress={elegirContacto}
              disabled={eligiendo}
              accessibilityRole="button"
              className="flex-row items-center justify-center gap-2 rounded-xl border border-[#E7E5E4] bg-white py-3 active:opacity-70"
            >
              <Ionicons name="person-add-outline" size={18} color="#3F4650" />
              <Text className="font-bold text-[#3F4650]">
                {eligiendo ? "Abriendo contactos..." : "Elegir de mis contactos"}
              </Text>
            </Pressable>

            <CampoTexto
              label="Nombre del contacto"
              placeholder="Ej. Mamá"
              value={contactoNombre}
              onChangeText={(v) => { setContactoNombre(v); limpiarError("contactoNombre"); }}
              autoCapitalize="words"
              error={errores.contactoNombre}
            />
            <CampoTexto
              label="Teléfono del contacto"
              placeholder="614 000 0000"
              value={contactoTelefono}
              onChangeText={(v) => {
                setContactoTelefono(v);
                setOpcionesTelefono([]);
                limpiarError("contactoTelefono");
              }}
              keyboardType="phone-pad"
              maxLength={16}
              error={errores.contactoTelefono}
            />
            {opcionesTelefono.length > 1 && (
              <View className="flex-row flex-wrap gap-2">
                {opcionesTelefono.map((n) => {
                  const activo = contactoTelefono === n;
                  return (
                    <Pressable
                      key={n}
                      onPress={() => setContactoTelefono(n)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: activo }}
                      className={`rounded-full border px-3 py-1.5 ${
                        activo ? "border-[#B84A4A] bg-[#FEF2F2]" : "border-[#E7E5E4] bg-white"
                      }`}
                    >
                      <Text className={`text-sm ${activo ? "font-bold text-[#B84A4A]" : "text-[#1C1917]"}`}>{n}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <BotonPrimario titulo="Crear cuenta" onPress={crearCuenta} cargando={cargando} />

          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-[#57534E]">¿Ya tienes cuenta?</Text>
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/iniciar-sesion"))}
              accessibilityRole="link"
              hitSlop={8}
            >
              <Text className="font-bold text-[#B84A4A]">Inicia sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
