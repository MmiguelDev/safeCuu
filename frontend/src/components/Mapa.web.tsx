import { forwardRef, useImperativeHandle, useRef } from "react";
import { html, type Coordenadas, type MapaRef, type Props } from "./mapaHtml";

export type { Coordenadas, MapaRef };

/**
 * Versión web del mapa: react-native-webview no existe en el navegador, así que el
 * mismo HTML de Leaflet se carga en un <iframe> y se controla con contentWindow.
 */
const Mapa = forwardRef<MapaRef, Props>(function Mapa({ inicial, zoomInicial = 13 }, ref) {
  const marco = useRef<HTMLIFrameElement>(null);
  // El HTML se arma una sola vez: cambiar `inicial` después no recarga el mapa.
  const fuente = useRef(html(inicial, zoomInicial)).current;
  // Si la ubicación llega antes de que cargue Leaflet, se guarda y se dibuja al terminar.
  const listo = useRef(false);
  const pendiente = useRef<{ c: Coordenadas; zoom: number } | null>(null);

  const dibujar = ({ latitude, longitude }: Coordenadas, zoom: number) => {
    const ventana = marco.current?.contentWindow as
      | (Window & { mostrarUbicacion?: (lat: number, lng: number, zoom: number) => void })
      | null
      | undefined;
    ventana?.mostrarUbicacion?.(latitude, longitude, zoom);
  };

  useImperativeHandle(ref, () => ({
    mostrarUbicacion: (c, zoom = 16) => {
      if (listo.current) dibujar(c, zoom);
      else pendiente.current = { c, zoom };
    },
  }));

  const alCargar = () => {
    listo.current = true;
    if (pendiente.current) {
      dibujar(pendiente.current.c, pendiente.current.zoom);
      pendiente.current = null;
    }
  };

  return (
    <iframe
      ref={marco}
      srcDoc={fuente}
      onLoad={alCargar}
      title="Mapa"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
});

export default Mapa;
