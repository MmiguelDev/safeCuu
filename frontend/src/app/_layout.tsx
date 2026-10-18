import "../../global.css";
import { Stack } from "expo-router";
import { AvatarProvider } from "../components/AvatarContext";

export default function RootLayout() {
  return (
    <AvatarProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="ayuda"
          options={{ headerShown: true, title: "Ayuda", headerBackTitle: "Atrás" }}
        />
        <Stack.Screen
          name="informacion-personal"
          options={{
            headerShown: true,
            title: "Información personal",
            headerBackTitle: "Atrás",
          }}
        />
      </Stack>
    </AvatarProvider>
  );
}
