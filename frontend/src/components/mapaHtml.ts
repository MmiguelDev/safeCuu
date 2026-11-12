/** HTML de Leaflet compartido por Mapa.tsx (WebView) y Mapa.web.tsx (iframe). */
export type Coordenadas = { latitude: number; longitude: number };

export type MapaRef = {
  /** Pone un pin en un lugar buscado y centra el mapa ahí (solo celular). */
  marcarLugar?: (c: Coordenadas, titulo: string) => void;
  /** Centra el mapa y dibuja el punto azul de "estás aquí". */
  mostrarUbicacion: (c: Coordenadas, zoom?: number) => void;
};

export type Props = { inicial: Coordenadas; zoomInicial?: number };

export const html = (c: Coordenadas, zoom: number) => `<!doctype html>
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
