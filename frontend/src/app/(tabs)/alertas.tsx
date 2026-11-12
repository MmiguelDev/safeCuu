import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AlertaCard from "../../components/AlertaCard";
import AlertaDetalle from "../../components/AlertaDetalle";
import { TIPO_UI } from "../../constants/estadoReporte";
import { Alerta } from "../../types/alerta";
import { Tipo } from "../../types/reporte";
import { useAuth } from "../../components/AuthContext";
import { escucharAlertas, marcarAlertasLeidas } from "../../services/alertas";
import { estaCerca, useMiUbicacion } from "../../services/cercania";

type Filtro = "todas" | Tipo | "urgentes";

const FILTROS: { id: Filtro; label: string; icono: keyof typeof Ionicons.glyphMap }[] = [
  { id: "todas",    label: "Todas",       icono: "list" },
  { id: "perdido",  label: TIPO_UI.perdido.plural,    icono: TIPO_UI.perdido.icono },
  { id: "encontrado", label: TIPO_UI.encontrado.plural, icono: TIPO_UI.encontrado.icono },
  { id: "peligro",  label: TIPO_UI.peligro.plural,    icono: TIPO_UI.peligro.icono },
  { id: "urgentes", label: "Urgentes",    icono: "alert-circle-outline" },
];

export default function Alertas() {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargado, setCargado] = useState(false);
  const { yo } = useMiUbicacion();

  // "Nuevas" = creadas después de la última visita. Se fija al entrar a la pestaña y
  // se actualiza al salir, para que las nuevas no desaparezcan mientras se ven.
  const lecturaUsuario = usuario?.ultimaLecturaAlertas ?? null;
  const ultimaLectura = useRef(lecturaUsuario);
  useEffect(() => {
    ultimaLectura.current = lecturaUsuario;
  }, [lecturaUsuario]);
  const [corte, setCorte] = useState<string | null>(lecturaUsuario);

  useFocusEffect(
    useCallback(() => {
      setCorte(ultimaLectura.current);
      return () => {
        if (uid) marcarAlertasLeidas(uid).catch(() => {});
      };
    }, [uid])
  );

  useEffect(() => {
    if (!uid) return;
    return escucharAlertas(
      uid,
      corte,
      (lista) => {
        setAlertas(lista);
        setCargado(true);
      },
      () => setCargado(true)
    );
  }, [uid, corte]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return alertas.filter((a) => {
      // Solo alertas a RADIO_KM o menos de la ubicación actual.
      if (!estaCerca(a, yo)) return false;
      const pasaFiltro =
        filtro === "todas"    ? true :
        filtro === "urgentes" ? a.prioridad === "alta" :
        a.tipo === filtro;
      const pasaBusqueda =
        !q || [a.titulo, a.ubicacion, a.descripcion].some((t) => t.toLowerCase().includes(q));
      return pasaFiltro && pasaBusqueda;
    });
  }, [alertas, filtro, busqueda, yo]);

  const detalle = alertas.find((a) => a.id === detalleId) ?? null;
  const nuevas   = visibles.filter((a) => !a.leida);
  const anteriores = visibles.filter((a) => a.leida);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}
      >
        {/* Título */}
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text accessibilityRole="header" className="text-3xl font-bold text-[#1C1917]">
              Mis <Text className="text-[#B84A4A]">Alertas</Text>
            </Text>
            <Text className="text-[#57534E]">Alertas a 1 km o menos de ti</Text>
          </View>
        </View>

        {/* Búsqueda */}
        <View className="flex-row items-center gap-3 rounded-full bg-[#F3F2F0] px-4">
          <Ionicons name="search" size={20} color="#57534E" />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar en alertas..."
            placeholderTextColor="#A8A29E"
            accessibilityLabel="Buscar en alertas"
            className="h-11 flex-1 text-[#1C1917]"
          />
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTROS.map((f) => {
            const activo = filtro === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFiltro(f.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
                  activo ? "bg-[#3F4650]" : "bg-[#F3F2F0]"
                }`}
              >
                <Ionicons name={f.icono} size={16} color={activo ? "white" : "#57534E"} />
                <Text className={activo ? "font-bold text-white" : "text-[#57534E]"}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Lista vacía */}
        {!cargado ? (
          <ActivityIndicator className="pt-12" color="#B84A4A" />
        ) : visibles.length === 0 ? (
          <View className="items-center gap-3 px-4 pt-12">
            <View className="h-28 w-28 items-center justify-center rounded-full bg-[#F6E3E1]">
              <Ionicons name="alert-circle-outline" size={48} color="#3F4650" />
            </View>
            <Text accessibilityRole="header" className="text-xl font-bold text-[#1C1917]">
              Sin alertas aquí
            </Text>
            <Text className="text-center text-[#57534E]">
              Cuando haya actividad en tu zona relacionada con este filtro aparecerá aquí.
            </Text>
          </View>
        ) : (
          <>
            {/* Nuevas */}
            {nuevas.length > 0 && (
              <>
                <View className="flex-row items-center gap-3">
                  <Text className="text-xs font-bold tracking-widest text-[#c0392b]">NUEVAS</Text>
                  <View className="h-px flex-1 bg-[#E7E5E4]" />
                </View>
                <View className="gap-3">
                  {nuevas.map((a) => (
                    <AlertaCard key={a.id} alerta={a} onPress={() => setDetalleId(a.id)} />
                  ))}
                </View>
              </>
            )}

            {/* Anteriores */}
            {anteriores.length > 0 && (
              <>
                <View className="flex-row items-center gap-3">
                  <Text className="text-xs font-bold tracking-widest text-[#c0392b]">ANTERIORES</Text>
                  <View className="h-px flex-1 bg-[#E7E5E4]" />
                </View>
                <View className="gap-3">
                  {anteriores.map((a) => (
                    <AlertaCard key={a.id} alerta={a} onPress={() => setDetalleId(a.id)} />
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <AlertaDetalle alerta={detalle} onCerrar={() => setDetalleId(null)} />
    </View>
  );
}
