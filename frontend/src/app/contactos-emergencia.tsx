import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Contact, requestPermissionsAsync } from "expo-contacts";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Contacto } from "../types/contacto";

const STORAGE_KEY = "safecuu:contactos_emergencia";

const nuevoId = () => Date.now().toString();
const soloDigitos = (s: string) => s.replace(/\D/g, "");

export default function ContactosEmergencia() {
  const router = useRouter();
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [form, setForm]           = useState<Partial<Contacto> | null>(null);
  const [opcionesTelefono, setOpcionesTelefono] = useState<string[]>([]);
  const [eligiendo, setEligiendo] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => { if (v) setContactos(JSON.parse(v)); })
      .catch(() => {});
  }, []);

  const guardar = (lista: Contacto[]) => {
    setContactos(lista);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista)).catch(() => {});
  };

  const abrirForm = (c?: Contacto) => {
    setOpcionesTelefono([]);
    setForm(c ?? { id: nuevoId(), nombre: "", telefono: "", relacion: "" });
  };

  const cerrarForm = () => {
    setOpcionesTelefono([]);
    setForm(null);
  };

  const elegirDeAgenda = async () => {
    if (eligiendo) return;
    setEligiendo(true);
    try {
      const { granted, canAskAgain } = await requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Permiso necesario",
          "Permite el acceso a tus contactos para elegir uno. También puedes escribirlo manualmente.",
          canAskAgain
            ? [{ text: "Entendido" }]
            : [
                { text: "Cancelar", style: "cancel" },
                { text: "Abrir ajustes", onPress: () => Linking.openSettings() },
              ]
        );
        return;
      }

      const elegido = await Contact.presentPicker();
      if (!elegido) return; // el usuario canceló

      const [nombre, telefonos] = await Promise.all([elegido.getFullName(), elegido.getPhones()]);
      const numeros = [
        ...new Set(telefonos.map((t) => t.number?.trim()).filter((n): n is string => !!n)),
      ];

      if (numeros.length === 0) {
        Alert.alert("Sin teléfono", `${nombre || "Este contacto"} no tiene un número guardado.`);
        return;
      }

      setOpcionesTelefono(numeros.length > 1 ? numeros : []);
      setForm((f) => ({ ...f, nombre: nombre || f?.nombre || "", telefono: numeros[0] }));
    } catch {
      Alert.alert("Error", "No se pudieron abrir tus contactos. Escríbelo manualmente.");
    } finally {
      setEligiendo(false);
    }
  };

  const confirmarGuardar = () => {
    if (!form?.nombre?.trim() || !form?.telefono?.trim()) {
      Alert.alert("Campos requeridos", "Nombre y teléfono son obligatorios.");
      return;
    }
    if (soloDigitos(form.telefono).length < 10) {
      Alert.alert("Teléfono inválido", "El teléfono debe tener al menos 10 dígitos.");
      return;
    }
    const repetido = contactos.find(
      (x) => x.id !== form.id && soloDigitos(x.telefono).slice(-10) === soloDigitos(form.telefono!).slice(-10)
    );
    if (repetido) {
      Alert.alert("Contacto repetido", `Ese número ya está guardado como ${repetido.nombre}.`);
      return;
    }
    const c = { ...form, nombre: form.nombre.trim(), telefono: form.telefono.trim() } as Contacto;
    const existe = contactos.find((x) => x.id === c.id);
    guardar(existe ? contactos.map((x) => (x.id === c.id ? c : x)) : [...contactos, c]);
    cerrarForm();
  };

  const eliminar = (id: string) => {
    Alert.alert("Eliminar contacto", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => guardar(contactos.filter((c) => c.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <Pressable
        onPress={() => router.back()}
        className="flex-row items-center gap-2 px-4 py-4 active:opacity-60"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F2F0]">
          <Ionicons name="chevron-back" size={22} color="#1C1917" />
        </View>
        <Text className="text-base font-semibold text-[#1C1917]">Volver</Text>
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        {/* Título */}
        <View>
          <Text className="text-3xl font-bold text-[#1C1917]">
            Contactos de <Text className="text-[#B84A4A]">Emergencia</Text>
          </Text>
          <Text className="mt-1 text-[#57534E]">
            Al activar el botón de pánico se les enviará un SMS con tu ubicación.
          </Text>
        </View>

        {/* Aviso */}
        <View className="flex-row items-start gap-3 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] p-4">
          <Ionicons name="information-circle-outline" size={20} color="#57534E" />
          <Text className="flex-1 text-sm text-[#57534E]">
            Agrega hasta 5 contactos de confianza. También se notificará al 911 automáticamente.
          </Text>
        </View>

        {/* Lista */}
        {contactos.length === 0 ? (
          <View className="items-center gap-3 pt-8">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-[#F6E3E1]">
              <Ionicons name="people-outline" size={40} color="#3F4650" />
            </View>
            <Text className="text-lg font-bold text-[#1C1917]">Sin contactos aún</Text>
            <Text className="text-center text-[#57534E]">
              Agrega a tus familiares o personas de confianza.
            </Text>
          </View>
        ) : (
          <View className="overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white">
            {contactos.map((c, i) => (
              <View
                key={c.id}
                className={`flex-row items-center px-4 py-4 ${i < contactos.length - 1 ? "border-b border-[#E7E5E4]" : ""}`}
              >
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#F3F2F0]">
                  <Ionicons name="person-outline" size={20} color="#57534E" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-[#1C1917]">{c.nombre}</Text>
                  <Text className="text-sm text-[#57534E]">{c.telefono}</Text>
                  {c.relacion ? <Text className="text-xs text-[#A8A29E]">{c.relacion}</Text> : null}
                </View>
                <Pressable
                  onPress={() => abrirForm(c)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                  className="p-1"
                >
                  <Ionicons name="pencil-outline" size={18} color="#57534E" />
                </Pressable>
                <Pressable
                  onPress={() => eliminar(c.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                  className="ml-2 p-1"
                >
                  <Ionicons name="trash-outline" size={18} color="#B84A4A" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Botón agregar */}
        {contactos.length < 5 && (
          <Pressable
            onPress={() => abrirForm()}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#3F4650] py-4 active:opacity-80"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="font-bold text-white">Agregar contacto</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Form modal inline */}
      {form && (
        <View
          style={{ position: "absolute", inset: 0, backgroundColor: "rgba(28,25,23,0.45)", justifyContent: "flex-end" }}
        >
          <Pressable style={{ flex: 1 }} onPress={cerrarForm} />
          <View className="rounded-t-3xl bg-white px-6 pb-12 pt-5">
            <View className="mb-5 h-1 w-9 self-center rounded-full bg-[#E7E5E4]" />
            <Text className="mb-5 text-xl font-bold text-[#1C1917]">
              {contactos.find((c) => c.id === form.id) ? "Editar contacto" : "Nuevo contacto"}
            </Text>

            <Pressable
              onPress={elegirDeAgenda}
              disabled={eligiendo}
              accessibilityRole="button"
              accessibilityLabel="Elegir de mis contactos"
              className="mb-4 flex-row items-center justify-center gap-2 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] py-3.5 active:opacity-70"
            >
              {eligiendo ? (
                <ActivityIndicator size="small" color="#3F4650" />
              ) : (
                <Ionicons name="person-add-outline" size={18} color="#3F4650" />
              )}
              <Text className="font-bold text-[#3F4650]">Elegir de mis contactos</Text>
            </Pressable>

            <View className="gap-4">
              <Campo
                label="Nombre"
                placeholder="Ej. Mamá"
                value={form.nombre ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, nombre: v }))}
              />
              <Campo
                label="Teléfono"
                placeholder="+52 614 000 0000"
                value={form.telefono ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, telefono: v }))}
                keyboardType="phone-pad"
              />
              {opcionesTelefono.length > 1 && (
                <View className="gap-1.5">
                  <Text className="text-xs font-semibold text-[#57534E]">Este contacto tiene varios números:</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {opcionesTelefono.map((n) => {
                      const activo = form.telefono === n;
                      return (
                        <Pressable
                          key={n}
                          onPress={() => setForm((f) => ({ ...f, telefono: n }))}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: activo }}
                          className={`rounded-full border px-3 py-1.5 ${activo ? "border-[#B84A4A] bg-[#FEF2F2]" : "border-[#E7E5E4] bg-white"}`}
                        >
                          <Text className={`text-sm ${activo ? "font-bold text-[#B84A4A]" : "text-[#1C1917]"}`}>{n}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
              <Campo
                label="Relación (opcional)"
                placeholder="Ej. Familiar, Amigo"
                value={form.relacion ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, relacion: v }))}
              />
            </View>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={cerrarForm}
                className="flex-1 items-center justify-center rounded-2xl bg-[#F3F2F0] py-4"
              >
                <Text className="font-bold text-[#1C1917]">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={confirmarGuardar}
                className="flex-1 items-center justify-center rounded-2xl bg-[#B84A4A] py-4"
              >
                <Text className="font-bold text-white">Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function Campo({
  label, placeholder, value, onChange, keyboardType,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; keyboardType?: "phone-pad" | "default";
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold text-[#57534E]">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#A8A29E"
        keyboardType={keyboardType ?? "default"}
        className="h-11 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] px-3 text-[#1C1917]"
      />
    </View>
  );
}
