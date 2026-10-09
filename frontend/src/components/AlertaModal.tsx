import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  titulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  onClose: () => void;
};

export default function AlertaModal({ visible, titulo, icono, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose} 
    >
      
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center px-6"
        onPress={onClose}
      >
       
        <Pressable
          className="bg-white w-full rounded-3xl p-6 items-center gap-4"
          onPress={() => {}}
        >
          <View className="bg-gray-200 p-3 rounded-full">
            <Ionicons name={icono} size={40} color="black" />
          </View>

          <Text className="text-black font-bold text-2xl">{titulo}</Text>

          <Text className="text-gray-600 text-center">
            Aquí va el formulario o la descripción de la alerta.
          </Text>

          <View className="flex-row gap-3 w-full">
            <Pressable
              onPress={onClose}
              className="flex-1 bg-gray-200 py-3 rounded-2xl items-center"
            >
              <Text className="font-bold text-black">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={onClose} 
              className="flex-1 bg-red-600 py-3 rounded-2xl items-center"
            >
              <Text className="font-bold text-white">Enviar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}