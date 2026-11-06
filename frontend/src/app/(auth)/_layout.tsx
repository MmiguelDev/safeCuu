import { Stack } from "expo-router";

// Sin sesión, la primera pantalla es "Inicia sesión" (no "Crea tu cuenta").
export const unstable_settings = {
  anchor: "iniciar-sesion",
};

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "white" } }}>
      <Stack.Screen name="iniciar-sesion" />
      <Stack.Screen name="registro" />
    </Stack>
  );
}
