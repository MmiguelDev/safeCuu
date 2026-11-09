import { useState, type ComponentProps } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAvatar } from "../components/AvatarContext";
import { useAuth } from "../components/AuthContext";
import { useContactos } from "../hooks/useContactos";
import { Contacto } from "../types/contacto";
import { TIPOS_SANGRE, Usuario } from "../types/usuario";


/** Campos editables de la cuenta (el celular es el usuario y no se edita). */
type Borrador = Pick<Usuario, "nombre" | "correo" | "tipoSangre">;

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const soloDigitos = (s: string) => s.replace(/\D/g, "");

const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

const llamar = (telefono: string) =>
  Linking.openURL(`tel:${soloDigitos(telefono)}`).catch(() =>
    Alert.alert("No se pudo llamar", "Tu dispositivo no puede realizar llamadas.")
  );

function Avatar({ nombre, avatarUri }: { nombre: string; avatarUri: string | null }) {
  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        className="h-28 w-28 rounded-full bg-slate-200"
        accessibilityLabel={nombre ? `Foto de ${nombre}` : "Tu foto de perfil"}
      />
    );
  }

  const ini = iniciales(nombre);
  return (
    <View className="h-28 w-28 items-center justify-center rounded-full bg-[#C2C2C2]">
      {ini ? (
        <Text className="text-4xl font-semibold text-white">{ini}</Text>
      ) : (
        <Ionicons name="person" size={52} color="white" />
      )}
    </View>
  );
}

function DatoPersonal({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="py-3">
      <Text className="text-sm text-slate-500">{etiqueta}</Text>
      <Text className={`mt-0.5 text-base font-medium ${valor ? "text-slate-900" : "text-slate-400"}`}>
        {valor || "Sin agregar"}
      </Text>
    </View>
  );
}

function CampoEditable({
  etiqueta,
  valor,
  onChange,
  ...rest
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
} & Omit<ComponentProps<typeof TextInput>, "value" | "onChangeText" | "onChange">) {
  return (
    <View className="py-2">
      <Text className="mb-1 text-sm text-slate-500">{etiqueta}</Text>
      <TextInput
        value={valor}
        onChangeText={onChange}
        accessibilityLabel={etiqueta}
        placeholderTextColor="#78716C"
        className="rounded-xl border border-slate-300 px-3 py-2.5 text-base text-slate-900"
        {...rest}
      />
    </View>
  );
}

function TarjetaContacto({ contacto }: { contacto: Contacto }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-1 pr-3">
        <Text className="text-base font-medium text-slate-900">{contacto.nombre}</Text>
        <Text className="text-sm text-slate-500">
          {contacto.relacion ? `${contacto.relacion} · ` : ""}
          {contacto.telefono}
        </Text>
      </View>
      <Pressable
        onPress={() => llamar(contacto.telefono)}
        accessibilityRole="button"
        accessibilityLabel={`Llamar a ${contacto.nombre}`}
        className="rounded-full bg-[#C0392B] px-4 py-2 active:opacity-80"
      >
        <Text className="font-semibold text-white">Llamar</Text>
      </Pressable>
    </View>
  );
}

export default function InformacionPersonal() {
  const router = useRouter();
  const { usuario: cuenta, actualizarUsuario } = useAuth();
  const usuario: Borrador = {
    nombre: cuenta?.nombre ?? "",
    correo: cuenta?.correo ?? "",
    tipoSangre: cuenta?.tipoSangre ?? null,
  };
  const telefonoCuenta = cuenta?.telefono ?? "";
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const { contactos } = useContactos();
  const { avatarUri, setAvatarUri } = useAvatar();

  const editando = borrador !== null;

  const guardarInformacion = () => {
    if (!borrador) return;
    const limpio: Borrador = {
      nombre: borrador.nombre.trim(),
      correo: borrador.correo.trim().toLowerCase(),
      tipoSangre: borrador.tipoSangre,
    };
    if (!limpio.nombre) {
      Alert.alert("Nombre requerido", "Escribe tu nombre.");
      return;
    }
    if (!CORREO_VALIDO.test(limpio.correo)) {
      Alert.alert("Correo inválido", "Revisa tu correo electrónico.");
      return;
    }
    setBorrador(null);
    actualizarUsuario(limpio).catch(() =>
      Alert.alert("Error", "No se pudo guardar tu información.")
    );
  };

  const formatearTelefono = (t: string) =>
    t.length === 10 ? `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}` : t;

  const cambiarFoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso necesario", "Permite el acceso a tus fotos para elegir un avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="px-5 pb-10 pt-6" keyboardShouldPersistTaps="handled">
        <View className="items-center">
          <Avatar nombre={usuario.nombre} avatarUri={avatarUri} />
          <Text className="mt-4 text-2xl font-bold text-slate-900">
            {usuario.nombre || "Tu perfil"}
          </Text>
          <Pressable onPress={cambiarFoto} accessibilityRole="button" className="mt-2 active:opacity-70">
            <Text className="font-medium text-[#000000]">Cambiar foto</Text>
          </Pressable>
        </View>

        <View className="mt-8 rounded-2xl bg-white px-5 py-2">
          {borrador ? (
            <>
              <CampoEditable
                etiqueta="Nombre"
                valor={borrador.nombre}
                onChange={(nombre) => setBorrador({ ...borrador, nombre })}
                placeholder="Tu nombre"
                autoCapitalize="words"
                textContentType="name"
              />
              <CampoEditable
                etiqueta="Correo electrónico"
                valor={borrador.correo}
                onChange={(correo) => setBorrador({ ...borrador, correo })}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />
              <View className="py-2">
                <Text className="mb-2 text-sm text-slate-500">Tipo de sangre</Text>
                <View className="flex-row flex-wrap gap-2">
                  {TIPOS_SANGRE.map((t) => {
                    const activo = borrador.tipoSangre === t;
                    return (
                      <Pressable
                        key={t}
                        onPress={() => setBorrador({ ...borrador, tipoSangre: activo ? null : t })}
                        accessibilityRole="radio"
                        accessibilityLabel={`Tipo de sangre ${t}`}
                        accessibilityState={{ selected: activo }}
                        className={`min-w-[56px] items-center rounded-full border px-3 py-1.5 ${
                          activo ? "border-[#B84A4A] bg-[#FEF2F2]" : "border-slate-300 bg-white"
                        }`}
                      >
                        <Text className={`text-sm ${activo ? "font-bold text-[#B84A4A]" : "text-slate-900"}`}>{t}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <Text className="pb-2 text-xs text-slate-500">
                Tu celular ({formatearTelefono(telefonoCuenta)}) es tu usuario y no se puede cambiar.
              </Text>
            </>
          ) : (
            <>
              <DatoPersonal etiqueta="Celular" valor={formatearTelefono(telefonoCuenta)} />
              <View className="h-px bg-slate-200" />
              <DatoPersonal etiqueta="Correo electrónico" valor={usuario.correo} />
              <View className="h-px bg-slate-200" />
              <DatoPersonal etiqueta="Tipo de sangre" valor={usuario.tipoSangre ?? ""} />
            </>
          )}
        </View>

        <View className="mt-6 rounded-2xl bg-white px-5 py-4">
          <Text className="text-lg font-semibold text-slate-900">Contactos de emergencia</Text>
          {contactos.length === 0 ? (
            <Text className="mt-3 text-slate-500">
              Aún no agregas contactos. Agrega al menos uno para que puedan ayudarte en una emergencia.
            </Text>
          ) : (
            <View className="mt-1">
              {contactos.map((contacto, indice) => (
                <View key={contacto.id}>
                  {indice > 0 && <View className="h-px bg-slate-200" />}
                  <TarjetaContacto contacto={contacto} />
                </View>
              ))}
            </View>
          )}
          <Pressable
            onPress={() => router.push("/contactos-emergencia")}
            accessibilityRole="button"
            className="mt-3 items-center rounded-xl border border-[#C2C2C2] py-3 active:opacity-70"
          >
            <Text className="font-semibold text-[#000000]">
              {contactos.length === 0 ? "Agregar contacto" : "Administrar contactos"}
            </Text>
          </Pressable>
        </View>

        {editando ? (
          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={() => setBorrador(null)}
              accessibilityRole="button"
              className="flex-1 items-center rounded-xl bg-[#F3F2F0] py-4 active:opacity-80"
            >
              <Text className="text-base font-semibold text-slate-900">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={guardarInformacion}
              accessibilityRole="button"
              className="flex-1 items-center rounded-xl bg-[#C0392B] py-4 active:opacity-80"
            >
              <Text className="text-base font-semibold text-white">Guardar</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setBorrador(usuario)}
            accessibilityRole="button"
            className="mt-6 items-center rounded-xl bg-[#C0392B] py-4 active:opacity-80"
          >
            <Text className="text-base font-semibold text-white">Editar información</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
