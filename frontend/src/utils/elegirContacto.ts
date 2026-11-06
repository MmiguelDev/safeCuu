import { Alert, Linking } from "react-native";
import { Contact, requestPermissionsAsync } from "expo-contacts";

export type ContactoElegido = {
  nombre: string;
  /** Números únicos del contacto, en el orden de la agenda. */
  numeros: string[];
};

/**
 * Abre el selector nativo de contactos. Muestra los avisos necesarios
 * (permiso denegado, contacto sin teléfono, error) y devuelve null en esos casos
 * o si el usuario cancela.
 */
export async function elegirContactoDeAgenda(): Promise<ContactoElegido | null> {
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
      return null;
    }

    const elegido = await Contact.presentPicker();
    if (!elegido) return null;

    const [nombre, telefonos] = await Promise.all([elegido.getFullName(), elegido.getPhones()]);
    const numeros = [
      ...new Set(telefonos.map((t) => t.number?.trim()).filter((n): n is string => !!n)),
    ];

    if (numeros.length === 0) {
      Alert.alert("Sin teléfono", `${nombre || "Este contacto"} no tiene un número guardado.`);
      return null;
    }

    return { nombre: nombre ?? "", numeros };
  } catch {
    Alert.alert("Error", "No se pudieron abrir tus contactos. Escríbelo manualmente.");
    return null;
  }
}
