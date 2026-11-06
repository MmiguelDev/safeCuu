import "../../global.css";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../components/AuthContext";

function Navegacion() {
  const { usuario, cargando } = useAuth();

  // Mientras se lee la sesión guardada no mostramos nada (evita parpadeo del login).
  if (cargando) return null;

  const conSesion = !!usuario;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={conSesion} redirectTo="/iniciar-sesion">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="contactos-emergencia" />
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
      </Stack.Protected>

      <Stack.Protected guard={!conSesion}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Navegacion />
    </AuthProvider>
  );
}
