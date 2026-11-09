import { Tipo } from "./reporte";

export type Prioridad = "alta" | "media" | "baja";

export type Alerta = {
  id: string;
  titulo: string;
  tipo: Tipo;
  descripcion: string;
  ubicacion: string;
  fecha: string; // ISO
  prioridad: Prioridad;
  reporteId?: string;
  /** Folio del reporte origen, para mostrarlo. */
  folio?: string;
  foto?: string | null;
  leida: boolean;
};
