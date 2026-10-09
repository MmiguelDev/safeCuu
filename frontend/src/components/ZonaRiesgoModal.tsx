import AlertaFormBase, { type AlertaData } from "./AlertaFormBase";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: AlertaData) => void;
};

export default function ZonaRiesgoModal(props: Props) {
  return (
    <AlertaFormBase
      {...props}
      tipo="peligro"
      config={{
        titulo: "Zona de riesgo",
        subtitulo:
          "Señala un punto peligroso de la ciudad para alertar a otros usuarios.",
        icono: "warning",
        placeholderDescripcion:
          "Describe el problema (ej. calle sin alumbrado, bache grande, zona con asaltos)...",
        labelFoto: "Foto del lugar",
      }}
    />
  );
}