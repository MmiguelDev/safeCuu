export type Estado = 'pendiente' | 'en_proceso' | 'resuelto';

export type Reporte = {
  id: string;
  titulo: string;
  tipo: 'perdido' | 'encontrado' | 'peligro';
  descripcion: string;
  ubicacion: string;
  fecha: string; // ISO: new Date().toISOString()
  estado: Estado; // siempre 'pendiente' al crear
};
