import type { LocationGeocodedAddress } from "expo-location";

/**
 * Arma "Calle 123, Colonia, Ciudad" a partir del resultado de reverseGeocodeAsync.
 * Android suele repetir la ciudad en subregion/region ("Chihuahua, Chihuahua"):
 * se quitan duplicados y se usa `name` cuando no viene la calle.
 */
export function direccionLegible(dir: LocationGeocodedAddress | undefined): string {
  if (!dir) return "";
  const calle = dir.street
    ? [dir.street, dir.streetNumber].filter(Boolean).join(" ")
    : dir.name ?? "";
  const partes = [calle, dir.district, dir.city ?? dir.subregion];
  const vistas = new Set<string>();
  return partes
    .filter((p): p is string => !!p && p.trim().length > 0)
    .filter((p) => {
      const clave = p.trim().toLowerCase();
      if (vistas.has(clave)) return false;
      vistas.add(clave);
      return true;
    })
    .join(", ");
}

/** Palabras que por sí solas no ubican nada (ciudad, estado, país). */
const GENERICAS = new Set(["chihuahua", "chih", "mexico", "méxico", "mx"]);

/**
 * true si el texto describe un lugar concreto: no vacío y con algo más que
 * ciudad/estado/país (p. ej. "Chihuahua, Chihuahua" no es válido).
 */
export function esUbicacionValida(texto: string): boolean {
  const utiles = texto
    .toLowerCase()
    .split(/[\s,.]+/)
    .filter((p) => p && !GENERICAS.has(p));
  return utiles.join("").length >= 3;
}
