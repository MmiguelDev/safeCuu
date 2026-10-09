import AlertaFormBase, { type AlertaData } from "./AlertaFormBase";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: AlertaData) => void;
};

export default function AlertaAnimalModal(props: Props) {
  return (
    <AlertaFormBase
      {...props}
      tipo="animal"
      config={{
        titulo: "Alerta animal",
        subtitulo:
          "Reporta un animal en situación de riesgo o peligro en la vía pública.",
        icono: "paw",
        placeholderDescripcion: "Describe la situación del animal...",
        labelFoto: "Foto del animal",
      }}
    />
  );
}