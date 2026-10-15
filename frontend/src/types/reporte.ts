export type Estado = 'pendiente' | 'en_proceso' | 'resuelto';
export type Tipo = 'perdido' | 'encontrado' | 'peligro';

export type Reporte = {
  id: string; // folio: "0001", "0002"...
  titulo: string;
  tipo: Tipo;
  descripcion: string;
  ubicacion: string;
  fecha: string; // ISO: new Date().toISOString()
  estado: Estado; // siempre 'pendiente' al crear
  fotos: string[]; // uris locales
};
