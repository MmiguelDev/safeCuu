import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAvatar } from "../components/AvatarContext";

type ContactoEmergencia = {
  id: string;
  nombre: string;
  parentesco: string;
  telefono: string;
};

type Usuario = {
  foto?: ImageSourcePropType;
  nombre: string;
  telefono: string;
  correo: string;
};

const USUARIO_EJEMPLO: Usuario = {
  nombre: "Juan Gabriel",
  telefono: "614 123 4567",
  correo: "elguerotranzas@gmail.com",
};

const CONTACTOS_EJEMPLO: ContactoEmergencia[] = [
  { id: "1", nombre: "Axel Lares", parentesco: "Familiar", telefono: "614 273 9301" },
  { id: "2", nombre: "Adrian Robles", parentesco: "Amigo", telefono: "614 385 9528" },
];

const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

const llamar = (telefono: string) =>
  Linking.openURL(`tel:${telefono.replace(/\s/g, "")}`);

function Avatar({ usuario, avatarUri }: { usuario: Usuario; avatarUri: string | null }) {
  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        className="h-28 w-28 rounded-full bg-slate-200"
        accessibilityLabel={`Foto de ${usuario.nombre}`}
      />
    );
  }

  return (
    <View className="h-28 w-28 items-center justify-center rounded-full bg-[#C2C2C2]">
      <Text className="text-4xl font-semibold text-white">{iniciales(usuario.nombre)}</Text>
    </View>
  );
}

function DatoPersonal({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="py-3">
      <Text className="text-sm text-slate-500">{etiqueta}</Text>
      <Text className="mt-0.5 text-base font-medium text-slate-900">{valor}</Text>
    </View>
  );
}

function TarjetaContacto({ contacto }: { contacto: ContactoEmergencia }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-1 pr-3">
        <Text className="text-base font-medium text-slate-900">{contacto.nombre}</Text>
        <Text className="text-sm text-slate-500">
          {contacto.parentesco} · {contacto.telefono}
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
  const [usuario] = useState<Usuario>(USUARIO_EJEMPLO);
  const [contactos] = useState<ContactoEmergencia[]>(CONTACTOS_EJEMPLO);
  const { avatarUri, setAvatarUri } = useAvatar();

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
      <ScrollView contentContainerClassName="px-5 pb-10 pt-6">
        <View className="items-center">
          <Avatar usuario={usuario} avatarUri={avatarUri} />
          <Text className="mt-4 text-2xl font-bold text-slate-900">{usuario.nombre}</Text>
          <Pressable onPress={cambiarFoto} className="mt-2 active:opacity-70">
            <Text className="font-medium text-[#000000]">Cambiar foto</Text>
          </Pressable>
        </View>

        <View className="mt-8 rounded-2xl bg-white px-5 py-2">
          <DatoPersonal etiqueta="Teléfono" valor={usuario.telefono} />
          <View className="h-px bg-slate-200" />
          <DatoPersonal etiqueta="Correo electrónico" valor={usuario.correo} />
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
            onPress={() => {}}
            accessibilityRole="button"
            className="mt-3 items-center rounded-xl border border-[#C2C2C2] py-3 active:opacity-70"
          >
            <Text className="font-semibold text-[#000000]">Agregar contacto</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => {}}
          accessibilityRole="button"
          className="mt-6 items-center rounded-xl bg-[#C0392B] py-4 active:opacity-80"
        >
          <Text className="text-base font-semibold text-white">Editar información</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}