import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-500">
      <Text className="text-3xl font-bold text-white">NativeWind funciona</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
