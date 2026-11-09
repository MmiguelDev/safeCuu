import { forwardRef, useImperativeHandle, useRef, type ComponentType, type Ref } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { WebView as WebViewOriginal } from "react-native-webview";

// Los tipos de react-native-webview 14 chocan con React 19.3 (sus props quedan en
// `never`); en ejecución funciona igual, así que se tipa solo lo que usamos.
type ControlWebView = { injectJavaScript: (codigo: string) => void };
const WebView = WebViewOriginal as unknown as ComponentType<{
  ref?: Ref<ControlWebView>;
  source: { html: string };
  originWhitelist?: string[];
  style?: StyleProp<ViewStyle>;
  javaScriptEnabled?: boolean;
  scrollEnabled?: boolean;
  overScrollMode?: "always" | "content" | "never";
  setBuiltInZoomControls?: boolean;
  onLoadEnd?: () => void;
  onMessage?: (e: { nativeEvent: { data: string } }) => void;
  containerStyle?: StyleProp<ViewStyle>;
  webviewDebuggingEnabled?: boolean;
}>;

/**
 * Mapa gratuito: Leaflet + mosaicos de CARTO (datos de OpenStreetMap) dentro de
 * un WebView. Sustituye a react-native-maps, que en Android exige una clave de
 * Google Maps y esa clave pide una cuenta de facturación.
 */

export type Coordenadas = { latitude: number; longitude: number };

export type MapaRef = {
  /** Centra el mapa y dibuja el punto azul de "estás aquí". */
  mostrarUbicacion: (c: Coordenadas, zoom?: number) => void;
};

type Props = { inicial: Coordenadas; zoomInicial?: number };

const html = (c: Coordenadas, zoom: number) => `<!doctype html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" integrity="sha384-c6Rcwz4e4CITMbu/NBmnNS8yN2sC3cUElMEMfP3vqqKFp7GOYaaBBCqmaWBjmkjb" crossorigin="anonymous" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js" integrity="sha384-NElt3Op+9NBMCYaef5HxeJmU4Xeard/Lku8ek6hoPTvYkQPh3zLIrJP7KiRocsxO" crossorigin="anonymous"></script>
<style>
  html, body, #mapa { margin: 0; height: 100%; width: 100%; background: #f2efe9; }
  .leaflet-control-attribution { font-size: 9px; }
</style>
</head><body>
<div id="mapa"></div>
<script>
  function avisar(m) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(String(m)); }
  window.onerror = function (msg, src, linea) { avisar("Error JS: " + msg + " (" + src + ":" + linea + ")"); };
  if (typeof L === "undefined") avisar("Leaflet no cargó (sin internet o CDN bloqueado)");
</script>
<script>
  var mapa = L.map("mapa", { zoomControl: false }).setView([${c.latitude}, ${c.longitude}], ${zoom});
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    subdomains: "abcd",
    attribution: "&copy; OpenStreetMap &copy; CARTO"
  }).on("tileerror", function (e) { avisar("No cargó un mosaico: " + (e.tile && e.tile.src)); }).addTo(mapa);
  var yo = null;
  window.mostrarUbicacion = function (lat, lng, zoom) {
    if (!yo) {
      yo = L.circleMarker([lat, lng], {
        radius: 8, color: "#ffffff", weight: 3, fillColor: "#1A73E8", fillOpacity: 1
      }).addTo(mapa);
    } else {
      yo.setLatLng([lat, lng]);
    }
    mapa.flyTo([lat, lng], zoom || mapa.getZoom());
  };
</script>
</body></html>`;

const Mapa = forwardRef<MapaRef, Props>(function Mapa({ inicial, zoomInicial = 13 }, ref) {
  const web = useRef<ControlWebView>(null);
  // El HTML se arma una sola vez: cambiar `inicial` después no recarga el mapa.
  const fuente = useRef({ html: html(inicial, zoomInicial) }).current;
  // Si la ubicación llega antes de que cargue Leaflet, se guarda y se dibuja al terminar.
  const listo = useRef(false);
  const pendiente = useRef<{ c: Coordenadas; zoom: number } | null>(null);

  const dibujar = ({ latitude, longitude }: Coordenadas, zoom: number) =>
    web.current?.injectJavaScript(
      `window.mostrarUbicacion && window.mostrarUbicacion(${latitude}, ${longitude}, ${zoom}); true;`
    );

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
    <WebView
      ref={web}
      source={fuente}
      originWhitelist={["*"]}
      style={StyleSheet.absoluteFill}
      containerStyle={StyleSheet.absoluteFill}
      webviewDebuggingEnabled={__DEV__}
      onMessage={(e) => console.warn("[Mapa]", e.nativeEvent.data)}
      javaScriptEnabled
      scrollEnabled={false}
      overScrollMode="never"
      setBuiltInZoomControls={false}
      onLoadEnd={alCargar}
    />
  );
});

export default Mapa;
