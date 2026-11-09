export const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export type TipoSangre = (typeof TIPOS_SANGRE)[number];

export type Usuario = {
  /** Id de Firebase Auth; también es el id del documento usuarios/{uid}. */
  uid: string;
  /** 10 dígitos, sin lada ni espacios. */
  telefono: string;
  nombre: string;
  correo: string;
  tipoSangre: TipoSangre | null;
  foto: string | null;
  creadoEn: string;
  /** Última vez que abrió la pestaña de Alertas (ISO). */
  ultimaLecturaAlertas: string | null;
};
