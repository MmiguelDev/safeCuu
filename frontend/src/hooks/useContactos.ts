import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { escucharContactos } from "../services/contactos";
import { Contacto } from "../types/contacto";

/**
 * Contactos de emergencia del usuario en tiempo real.
 * Usa la caché offline de Firestore, así el botón de pánico los tiene aunque no haya internet.
 */
export function useContactos() {
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  // Se guarda junto con el uid para descartar la lista de una sesión anterior.
  const [datos, setDatos] = useState<{ uid: string; lista: Contacto[] } | null>(null);

  useEffect(() => {
    if (!uid) return;
    return escucharContactos(uid, (lista) => setDatos({ uid, lista }));
  }, [uid]);

  const vigente = uid && datos?.uid === uid;
  return {
    contactos: vigente ? datos.lista : [],
    cargando: !!uid && !vigente,
    uid,
  };
}
