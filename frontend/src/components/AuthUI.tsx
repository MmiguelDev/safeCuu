import type { ComponentProps, ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

/** Paleta compartida con PanicoModal y Contactos de emergencia. */
export const COLORES = {
  rojo: "#B84A4A",
  rojoSuave: "#FEF2F2",
  texto: "#1C1917",
  textoSecundario: "#57534E",
  placeholder: "#78716C",
  borde: "#E7E5E4",
  fondoCampo: "#FAFAF9",
  fondoBoton: "#F3F2F0",
  pizarra: "#3F4650",
} as const;

type CampoTextoProps = {
  label: string;
  error?: string | null;
  opcional?: boolean;
  prefijo?: string;
} & ComponentProps<typeof TextInput>;

export function CampoTexto({ label, error, opcional, prefijo, ...rest }: CampoTextoProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold text-[#57534E]">
        {label}
        {opcional ? <Text className="font-normal text-[#78716C]"> (opcional)</Text> : null}
      </Text>
      <View
        className={`h-12 flex-row items-center rounded-xl border bg-[#FAFAF9] px-3 ${
          error ? "border-[#B84A4A]" : "border-[#E7E5E4]"
        }`}
      >
        {prefijo ? (
          <Text className="mr-2 border-r border-[#E7E5E4] pr-2 text-base font-semibold text-[#57534E]">
            {prefijo}
          </Text>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={COLORES.placeholder}
          className="h-full flex-1 text-base text-[#1C1917]"
          {...rest}
        />
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" className="text-xs font-medium text-[#B84A4A]">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function BotonPrimario({
  titulo,
  onPress,
  cargando,
  deshabilitado,
}: {
  titulo: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
}) {
  const inactivo = cargando || deshabilitado;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      className={`h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80 ${
        inactivo ? "bg-[#D17070]" : "bg-[#B84A4A]"
      }`}
    >
      {cargando ? <ActivityIndicator color="white" /> : null}
      <Text className="text-base font-bold text-white">{titulo}</Text>
    </Pressable>
  );
}

export function TituloSeccion({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row items-center gap-3">
      <Text accessibilityRole="header" className="text-xs font-bold tracking-widest text-[#B84A4A]">
        {children}
      </Text>
      <View className="h-px flex-1 bg-[#E7E5E4]" />
    </View>
  );
}
