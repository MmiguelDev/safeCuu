export type Estado = 'pendiente' | 'en_proceso' | 'resuelto';
export type Tipo = 'perdido' | 'encontrado' | 'peligro';

export type Reporte = {
  id: string; // id del documento en Firestore
  folio: string; // consecutivo visible: "0001", "0002"...
  titulo: string;
  tipo: Tipo;
  descripcion: string;
  ubicacion: string;
  fecha: string; // ISO: new Date().toISOString()
  estado: Estado; // siempre 'pendiente' al crear
  fotos: string[]; // data URIs (comprimidas) o uris locales antes de guardar
  /** Alerta pública que se creó junto con el reporte. */
  alertaId?: string | null;
};
