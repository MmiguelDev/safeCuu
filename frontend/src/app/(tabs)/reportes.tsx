import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfirmacionReporte from "../../components/ConfirmacionReporte";
import NuevoReporteModal, { ReporteData } from "../../components/NuevoReporteModal";
import ReporteCard from "../../components/ReporteCard";
import ReporteDetalle from "../../components/ReporteDetalle";
import { TIPO_UI } from "../../constants/estadoReporte";
import { useAuth } from "../../components/AuthContext";
import { actualizarReporte, crearReporte, escucharMisReportes, resolverReporte } from "../../services/reportes";
import { Reporte, Tipo } from "../../types/reporte";

type Filtro = "todos" | Tipo | "resueltos";
const FILTROS: { id: Filtro; label: string; icono: keyof typeof Ionicons.glyphMap }[] = [
  { id: "todos", label: "Todos", icono: "list" },
  { id: "perdido", label: TIPO_UI.perdido.plural, icono: TIPO_UI.perdido.icono },
  { id: "encontrado", label: TIPO_UI.encontrado.plural, icono: TIPO_UI.encontrado.icono },
  { id: "peligro", label: TIPO_UI.peligro.plural, icono: TIPO_UI.peligro.icono },
  { id: "resueltos", label: "Resueltos", icono: "checkmark-circle-outline" },
];

const luego = (fn: () => void) => setTimeout(fn, 350);

const mensajeDe = (e: unknown, porDefecto: string) => (e instanceof Error && e.message ? e.message : porDefecto);

export default function Reportes() {
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargado, setCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");

  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Reporte | null>(null);
  const [recienCreado, setRecienCreado] = useState<Reporte | null>(null);

  // Reportes del usuario en tiempo real (con caché offline de Firestore).
  useEffect(() => {
    if (!uid) return;
    return escucharMisReportes(
      uid,
      (lista) => {
        setReportes(lista);
        setCargado(true);
      },
      () => setCargado(true)
    );
  }, [uid]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return reportes.filter((r) => {
      const pasaFiltro =
        filtro === "todos" ? true : filtro === "resueltos" ? r.estado === "resuelto" : r.tipo === filtro;
      const pasaBusqueda =
        !q || [r.titulo, r.ubicacion, r.descripcion, r.folio].some((t) => t.toLowerCase().includes(q));
      return pasaFiltro && pasaBusqueda;
    });
  }, [reportes, filtro, busqueda]);

  const detalle = reportes.find((r) => r.id === detalleId) ?? null;

  const nuevoReporte = () => {
    setEditando(null);
    setFormAbierto(true);
  };

  const guardar = async (data: ReporteData) => {
    if (!uid) return;
    setFormAbierto(false);
    setGuardando(true);
    try {
      if (editando) {
        const id = editando.id;
        await actualizarReporte(editando, data);
        luego(() => setDetalleId(id));
        return;
      }
      const creado = await crearReporte(uid, data);
      luego(() => setRecienCreado(creado));
    } catch (e) {
      Alert.alert(
        "No se pudo guardar",
        mensajeDe(e, "Revisa tu conexión a internet e intenta de nuevo.")
      );
    } finally {
      setGuardando(false);
    }
  };

  const cerrarForm = () => {
    setFormAbierto(false);
    if (editando) {
      const id = editando.id;
      luego(() => setDetalleId(id));
    }
  };

  const editar = () => {
    if (!detalle) return;
    const r = detalle;
    setDetalleId(null);
    luego(() => {
      setEditando(r);
      setFormAbierto(true);
    });
  };

  const resolver = () => {
    if (!detalle) return;
    resolverReporte(detalle).catch((e) =>
      Alert.alert("No se pudo actualizar", mensajeDe(e, "Intenta de nuevo."))
    );
  };

  const verRecienCreado = () => {
    const id = recienCreado?.id ?? null;
    setRecienCreado(null);
    luego(() => setDetalleId(id));
  };

  const hayReportes = reportes.length > 0;

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
              Mis <Text className="text-[#B84A4A]">Reportes</Text>
            </Text>
            <Text className="text-[#57534E]">Aquí puedes ver el historial de tus reportes</Text>
          </View>
          <Pressable
            onPress={nuevoReporte}
            disabled={guardando}
            accessibilityRole="button"
            accessibilityLabel="Nuevo reporte"
            className="items-center gap-1 rounded-2xl border border-[#E7E5E4] bg-white px-3 py-2 active:bg-[#FAFAF9]"
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#B84A4A]">
              <Ionicons name="add" size={20} color="white" />
            </View>
            <Text className="text-center text-xs font-bold text-[#B84A4A]">Nuevo{"\n"}reporte</Text>
          </Pressable>
        </View>

        {/* Búsqueda */}
        <View className="flex-row items-center gap-3 rounded-full bg-[#F3F2F0] px-4">
          <Ionicons name="search" size={20} color="#57534E" />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar en mis reportes..."
            placeholderTextColor="#A8A29E"
            editable={hayReportes}
            accessibilityLabel="Buscar en mis reportes"
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

        {guardando && (
          <View className="flex-row items-center gap-3 rounded-2xl bg-[#F3F2F0] px-4 py-3">
            <ActivityIndicator color="#B84A4A" />
            <Text className="text-[#57534E]">Guardando reporte...</Text>
          </View>
        )}

        {/* Lista / vacío */}
        {!cargado ? (
          <ActivityIndicator className="pt-12" color="#B84A4A" />
        ) : !hayReportes ? (
          <View className="items-center gap-3 px-4 pt-12">
            <View className="h-28 w-28 items-center justify-center rounded-full bg-[#F6E3E1]">
              <Ionicons name="document-text-outline" size={48} color="#3F4650" />
              <View className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full border border-[#E7E5E4] bg-white">
                <Ionicons name="location" size={18} color="#B84A4A" />
              </View>
            </View>
            <Text accessibilityRole="header" className="text-xl font-bold text-[#1C1917]">
              Aún no tienes reportes
            </Text>
            <Text className="text-center text-[#57534E]">
              Aquí aparecerán tus reportes de mascotas perdidas o encontradas y de peligros en tu zona.
            </Text>
            <Pressable
              onPress={nuevoReporte}
              accessibilityRole="button"
              className="mt-2 flex-row items-center gap-2 rounded-full bg-[#3F4650] px-6 py-4 active:opacity-80"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="font-bold text-white">Crear mi primer reporte</Text>
            </Pressable>
          </View>
        ) : visibles.length === 0 ? (
          <Text className="pt-8 text-center text-[#57534E]">No hay reportes que coincidan.</Text>
        ) : (
          visibles.map((r) => <ReporteCard key={r.id} reporte={r} onPress={() => setDetalleId(r.id)} />)
        )}
      </ScrollView>

      <ReporteDetalle
        reporte={detalle}
        onCerrar={() => setDetalleId(null)}
        onEditar={editar}
        onResolver={resolver}
      />
      {formAbierto && (
        <NuevoReporteModal inicial={editando} onClose={cerrarForm} onGuardar={guardar} />
      )}
      <ConfirmacionReporte
        reporte={recienCreado}
        onVer={verRecienCreado}
        onCerrar={() => setRecienCreado(null)}
      />
    </View>
  );
}
