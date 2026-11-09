import "../../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../components/AuthContext";

function Navegacion() {
  const { usuario, sesionActiva, cargando } = useAuth();
  const segmentos = useSegments();
  const router = useRouter();

  // Tres estados: sin sesión → login; número verificado sin perfil → registro; con perfil → app.
  const conPerfil = !!usuario;
  const faltaRegistro = sesionActiva && !usuario;

  // Stack.Protected no redirige la ruta inicial "/" (es de (tabs), protegida) cuando
  // no hay sesión: sin esto la app abre en "Unmatched Route". Aquí mandamos a cada
  // estado a su pantalla si la actual no le corresponde.
  const primerSegmento = segmentos[0] as string | undefined;
  useEffect(() => {
    if (cargando) return;
    const enAuth = primerSegmento === "(auth)";
    const enRegistro = primerSegmento === "registro";
    if (!sesionActiva && !enAuth) router.replace("/iniciar-sesion");
    else if (faltaRegistro && !enRegistro) router.replace("/registro");
    else if (conPerfil && (enAuth || enRegistro || primerSegmento === "+not-found")) router.replace("/");
  }, [cargando, sesionActiva, faltaRegistro, conPerfil, primerSegmento, router]);

  // Mientras se lee la sesión guardada no mostramos nada (evita parpadeo del login).
  if (cargando) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={conPerfil}>
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

      <Stack.Protected guard={faltaRegistro}>
        <Stack.Screen name="registro" />
      </Stack.Protected>

      <Stack.Protected guard={!sesionActiva}>
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
