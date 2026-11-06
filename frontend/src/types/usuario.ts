export const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export type TipoSangre = (typeof TIPOS_SANGRE)[number];

export type Usuario = {
  /** 10 dígitos, sin lada ni espacios. Es el identificador para iniciar sesión. */
  telefono: string;
  nombre: string;
  correo: string;
  tipoSangre: TipoSangre | null;
  foto: string | null;
  creadoEn: string;
};
