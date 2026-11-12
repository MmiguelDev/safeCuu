import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { type Coordenadas, type MapaRef, type Props } from "./mapaHtml";

export type { Coordenadas, MapaRef };

/**
 * Mapa nativo con react-native-maps (Google Maps en Android, Apple Maps en iOS).
 * Funciona en Expo Go sin configurar nada. Para el APK de Android hace falta una
 * clave de Google Maps en app.json (android.config.googleMaps.apiKey).
 * En web se usa Mapa.web.tsx (Leaflet), porque react-native-maps no soporta web.
 */

/** Convierte un nivel de zoom estilo web (13, 16…) al delta de latitud de react-native-maps. */
const deltaDeZoom = (zoom: number) => 360 / Math.pow(2, zoom);

const Mapa = forwardRef<MapaRef, Props>(function Mapa({ inicial, zoomInicial = 13 }, ref) {
  const mapa = useRef<MapView>(null);
  // La región inicial se fija una sola vez: cambiar `inicial` después no mueve el mapa.
  const regionInicial = useRef({
    ...inicial,
    latitudeDelta: deltaDeZoom(zoomInicial),
    longitudeDelta: deltaDeZoom(zoomInicial),
  }).current;

  const [lugar, setLugar] = useState<{ c: Coordenadas; titulo: string } | null>(null);

  // Si piden centrar antes de que el mapa esté listo (p. ej. al abrir la app),
  // se guarda y se aplica en onMapReady; si no, la animación se pierde.
  const listo = useRef(false);
  const pendiente = useRef<{ c: Coordenadas; zoom: number } | null>(null);

  const centrar = (c: Coordenadas, zoom: number) => {
    if (!listo.current) {
      pendiente.current = { c, zoom };
      return;
    }
    mapa.current?.animateToRegion(
      { ...c, latitudeDelta: deltaDeZoom(zoom), longitudeDelta: deltaDeZoom(zoom) },
      800
    );
  };

  const alEstarListo = () => {
    listo.current = true;
    if (pendiente.current) {
      const { c, zoom } = pendiente.current;
      pendiente.current = null;
      centrar(c, zoom);
    }
  };

  useImperativeHandle(ref, () => ({
    mostrarUbicacion: (c, zoom = 16) => centrar(c, zoom),
    marcarLugar: (c, titulo) => {
      setLugar({ c, titulo });
      centrar(c, 16);
    },
  }));

  return (
    <MapView
      ref={mapa}
      style={StyleSheet.absoluteFill}
      initialRegion={regionInicial}
      showsUserLocation
      showsMyLocationButton={false}
      onMapReady={alEstarListo}
    >
      {lugar && <Marker coordinate={lugar.c} title={lugar.titulo} />}
    </MapView>
  );
});

export default Mapa;
