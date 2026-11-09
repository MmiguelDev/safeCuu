import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

/**
 * Las imágenes se guardan dentro del documento de Firestore como data URI
 * (`data:image/jpeg;base64,...`) para no depender de Firebase Storage, que
 * exige el plan Blaze. Un documento admite máximo 1 MB, así que se reducen
 * mucho: una foto de perfil queda en ~20-60 KB.
 */
const ANCHO_MAX = 400;
const CALIDAD = 0.6;
/** Tope de seguridad (≈ 300 KB de texto); debe coincidir con firestore.rules. */
export const TAMANO_MAX_IMAGEN = 300_000;

/** true si la imagen ya está lista para guardarse (no hay que volver a procesarla). */
export const esImagenGuardada = (uri: string) => /^(data:|https?:\/\/)/.test(uri);

/** Comprime una imagen local y la devuelve como data URI para guardarla en Firestore. */
export async function prepararImagen(uriLocal: string): Promise<string> {
  if (esImagenGuardada(uriLocal)) return uriLocal;

  const contexto = ImageManipulator.manipulate(uriLocal);
  contexto.resize({ width: ANCHO_MAX });
  const imagen = await contexto.renderAsync();
  const { base64 } = await imagen.saveAsync({ format: SaveFormat.JPEG, compress: CALIDAD, base64: true });

  const dataUri = `data:image/jpeg;base64,${base64}`;
  if (!base64 || dataUri.length > TAMANO_MAX_IMAGEN) {
    throw new Error("La imagen es demasiado pesada. Intenta con otra foto.");
  }
  return dataUri;
}
