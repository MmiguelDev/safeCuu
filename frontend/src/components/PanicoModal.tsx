import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useContactos } from "../hooks/useContactos";
import { useAuth } from "./AuthContext";
import { registrarEventoPanico } from "../services/panico";
import {
  EstadoEnvio,
  enviarAlertaEmergencia,
  obtenerUbicacion,
} from "../utils/enviarEmergencia";

const ICONO_ESTADO: Record<EstadoEnvio, { name: keyof typeof Ionicons.glyphMap; color: string; texto: string }> = {
  enviando:      { name: "radio-outline",          color: "#A16F1D", texto: "Enviando" },
  enviado:       { name: "checkmark-circle",       color: "#4F8A67", texto: "Enviado" },
  sin_confirmar: { name: "help-circle-outline",    color: "#A16F1D", texto: "Abierto" },
  cancelado:     { name: "remove-circle-outline",  color: "#B84A4A", texto: "Cancelado" },
  error:         { name: "close-circle",           color: "#B84A4A", texto: "Error" },
};


type Fase = "idle" | "enviando" | "listo";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function PanicoModal({ visible, onClose, onConfirm }: Props) {
  const [fase, setFase] = useState<Fase>("idle");
  const { contactos } = useContactos();
  const { usuario } = useAuth();
  const [resultados, setResultados] = useState<Record<string, EstadoEnvio>>({});
  const [canal, setCanal] = useState<"whatsapp" | "sms">("whatsapp");

  const overlayOpacity = useSharedValue(0);
  const sheetOpacity   = useSharedValue(0);
  const ring1Scale     = useSharedValue(1);
  const ring1Opacity   = useSharedValue(0.4);
  const ring2Scale     = useSharedValue(1);
  const ring2Opacity   = useSharedValue(0.2);

  /* eslint-disable react-hooks/immutability */
  const startRings = useCallback(() => {
    ring1Scale.value = withRepeat(
      withSequence(
        withTiming(1.55, { duration: 1100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ), -1
    );
    ring1Opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1100, easing: Easing.out(Easing.ease) }),
        withTiming(0.4, { duration: 0 })
      ), -1
    );
    ring2Scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(1.9, { duration: 1600, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ), -1
    );
    ring2Opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 0 }),
        withTiming(0, { duration: 1600, easing: Easing.out(Easing.ease) }),
        withTiming(0.15, { duration: 0 })
      ), -1
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // shared values from useSharedValue are stable refs

  const stopRings = useCallback(() => {
    ring1Scale.value   = withTiming(1);
    ring1Opacity.value = withTiming(0);
    ring2Scale.value   = withTiming(1);
    ring2Opacity.value = withTiming(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // shared values from useSharedValue are stable refs
  /* eslint-enable react-hooks/immutability */

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (visible) {
      /* eslint-disable react-hooks/immutability */
      overlayOpacity.value = withTiming(1, { duration: 200 });
      sheetOpacity.value   = withTiming(1, { duration: 200 });
      /* eslint-enable react-hooks/immutability */
      startRings();
    } else {
      /* eslint-disable react-hooks/immutability */
      overlayOpacity.value = withTiming(0, { duration: 180 });
      sheetOpacity.value   = withTiming(0, { duration: 180 });
      /* eslint-enable react-hooks/immutability */
      stopRings();
      const t = setTimeout(() => {
        setFase("idle");
        setResultados({});
      }, 200);
      return () => clearTimeout(t);
    }
  }, [visible]); // shared values and callbacks are stable

  const handleEnviar = async () => {
    setFase("enviando");
    stopRings();

    const setEstado = (id: string, estado: EstadoEnvio) =>
      setResultados((prev) => ({ ...prev, [id]: estado }));

    try {
      const ubicacion = await obtenerUbicacion();
      const r = await enviarAlertaEmergencia(contactos, ubicacion, setEstado);
      setCanal(r.canal);
      // Historial en Firestore; si no hay internet se sube al reconectar.
      if (usuario) {
        registrarEventoPanico(usuario.uid, {
          ubicacion,
          canal: r.canal,
          contactos: contactos.length,
        }).catch(() => {});
      }
    } catch {
      // Cualquier fallo inesperado: marcar como error lo que siga pendiente
      setResultados((prev) => {
        const next = { ...prev };
        [...contactos.map((c) => c.id), "policia"].forEach((id) => {
          if (!next[id] || next[id] === "enviando") next[id] = "error";
        });
        return next;
      });
    } finally {
      // Mostramos el resultado; el usuario cierra manualmente.
      setFase("listo");
      onConfirm();
    }
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const sheetStyle   = useAnimatedStyle(() => ({ opacity: sheetOpacity.value }));
  const ring1Style   = useAnimatedStyle(() => ({ transform: [{ scale: ring1Scale.value }], opacity: ring1Opacity.value }));
  const ring2Style   = useAnimatedStyle(() => ({ transform: [{ scale: ring2Scale.value }], opacity: ring2Opacity.value }));

  if (!visible) return null;

  const destinatarios = [
    ...contactos.map((c) => ({ id: c.id, nombre: c.nombre, sub: c.relacion || c.telefono, icono: "person-outline" as const })),
    { id: "policia", nombre: "Policía", sub: "911 · Emergencias", icono: "shield-outline" as const },
  ];
  const sinContactos = contactos.length === 0;

  const estadosContactos = contactos.map((c) => resultados[c.id]);
  const algunoOk = estadosContactos.some((e) => e === "enviado" || e === "sin_confirmar");
  const todosEnviados = estadosContactos.length > 0 && estadosContactos.every((e) => e === "enviado");
  const resumen = todosEnviados
    ? { titulo: "Alerta enviada", icono: "checkmark-circle" as const, color: "#4F8A67", fondo: "#E4EFE8" }
    : algunoOk
    ? { titulo: "Revisa el envío", icono: "alert-circle" as const, color: "#A16F1D", fondo: "#FBF1DF" }
    : { titulo: "No se pudo enviar", icono: "close-circle" as const, color: "#B84A4A", fondo: "#FEF2F2" };

  return (
    <Modal visible transparent animationType="none" onRequestClose={fase !== "enviando" ? onClose : undefined} statusBarTranslucent>
      <Animated.View style={[{ position: "absolute", inset: 0, backgroundColor: "rgba(28,25,23,0.5)" }, overlayStyle]}>
        <Pressable style={{ flex: 1 }} onPress={fase !== "enviando" ? onClose : undefined} />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute", bottom: 0, left: 0, right: 0,
            backgroundColor: "white",
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            paddingHorizontal: 24, paddingTop: 16, paddingBottom: 52,
            alignItems: "center", gap: 20,
          },
          sheetStyle,
        ]}
      >
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E7E5E4" }} />

        {/* ── Listo ── */}
        {fase === "listo" ? (
          <>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: resumen.fondo, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={resumen.icono} size={44} color={resumen.color} />
            </View>
            <Text accessibilityRole="header" style={{ fontSize: 20, fontWeight: "700", color: "#1C1917" }}>{resumen.titulo}</Text>
            <View style={{ width: "100%", gap: 8 }}>
              {destinatarios.map((t) => {
                const info = ICONO_ESTADO[resultados[t.id] ?? "error"];
                return (
                  <View
                    key={t.id}
                    accessible
                    accessibilityLabel={`${t.nombre}: ${info.texto}`}
                    style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: "#FAFAF9", borderWidth: 1, borderColor: "#E7E5E4" }}
                  >
                    <Ionicons name={t.icono} size={20} color="#57534E" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#1C1917" }}>{t.nombre}</Text>
                      <Text style={{ fontSize: 12, color: "#57534E" }}>{t.sub}</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: info.color }}>{info.texto}</Text>
                    <Ionicons name={info.name} size={20} color={info.color} />
                  </View>
                );
              })}
            </View>
            {!todosEnviados && (
              <Text style={{ fontSize: 13, color: "#57534E", textAlign: "center", lineHeight: 18 }}>
                {algunoOk
                  ? canal === "whatsapp"
                    ? "Revisa en WhatsApp que cada mensaje se haya enviado."
                    : "Confirma en tu app de Mensajes que el SMS se haya enviado."
                  : "Llama directamente al 911 o a tus contactos."}
              </Text>
            )}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={{ width: "100%", height: 50, borderRadius: 16, backgroundColor: "#F3F2F0", alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1C1917" }}>Cerrar</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#1C1917", textAlign: "center" }}>
              {fase === "enviando" ? "Enviando alertas..." : "Alerta de emergencia"}
            </Text>
            <Text style={{ fontSize: 14, color: "#57534E", textAlign: "center", lineHeight: 20 }}>
              {fase === "enviando"
                ? "Se abrirá WhatsApp con tu ubicación para cada contacto. Presiona enviar y regresa a SafeCuu para continuar con el siguiente."
                : "Presiona el botón para enviar tu ubicación por WhatsApp a tus contactos de emergencia."}
            </Text>

            {/* Botón con anillos */}
            <View style={{ alignItems: "center", justifyContent: "center", height: 196 }}>
              <Animated.View style={[{ position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "#B84A4A" }, ring2Style]} />
              <Animated.View style={[{ position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "#B84A4A" }, ring1Style]} />
              <Pressable
                onPress={fase === "idle" ? handleEnviar : undefined}
                accessibilityRole="button"
                accessibilityLabel="Enviar alerta de emergencia"
                style={{
                  width: 148, height: 148, borderRadius: 74,
                  backgroundColor: fase === "enviando" ? "#D17070" : "#B84A4A",
                  alignItems: "center", justifyContent: "center",
                  shadowColor: "#B84A4A",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35, shadowRadius: 14, elevation: 10,
                }}
              >
                <Ionicons name={fase === "enviando" ? "radio-outline" : "warning-outline"} size={56} color="white" />
              </Pressable>
            </View>

            {/* Lista de destinatarios con estado (enviando) */}
            {fase === "enviando" && (
              <View style={{ width: "100%", gap: 8 }}>
                {destinatarios.map((t) => {
                  const estado = resultados[t.id];
                  return (
                    <View key={t.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: "#FAFAF9", borderWidth: 1, borderColor: "#E7E5E4" }}>
                      <Ionicons name={t.icono} size={20} color="#57534E" />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1C1917" }}>{t.nombre}</Text>
                        <Text style={{ fontSize: 12, color: "#57534E" }}>{t.sub}</Text>
                      </View>
                      {estado
                        ? <Ionicons name={ICONO_ESTADO[estado].name} size={20} color={ICONO_ESTADO[estado].color} />
                        : <Ionicons name="ellipsis-horizontal" size={18} color="#A8A29E" />}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Lista destinatarios en idle */}
            {fase === "idle" && (
              <View style={{ width: "100%", gap: 8 }}>
                {sinContactos ? (
                  <Pressable
                    onPress={() => { onClose(); router.push("/contactos-emergencia"); }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#F6C8C8" }}
                  >
                    <Ionicons name="alert-circle-outline" size={20} color="#B84A4A" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#B84A4A" }}>Sin contactos configurados</Text>
                      <Text style={{ fontSize: 12, color: "#B84A4A", opacity: 0.8 }}>Toca para agregar tus contactos de emergencia</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#B84A4A" />
                  </Pressable>
                ) : (
                  destinatarios.map((t) => (
                    <View key={t.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: "#FAFAF9", borderWidth: 1, borderColor: "#E7E5E4" }}>
                      <Ionicons name={t.icono} size={20} color="#57534E" />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#1C1917" }}>{t.nombre}</Text>
                        <Text style={{ fontSize: 12, color: "#57534E" }}>{t.sub}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {fase === "idle" && (
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                style={{ width: "100%", height: 50, borderRadius: 16, backgroundColor: "#F3F2F0", alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#1C1917" }}>Cancelar</Text>
              </Pressable>
            )}
          </>
        )}
      </Animated.View>
    </Modal>
  );
}
