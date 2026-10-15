const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const dos = (n: number) => String(n).padStart(2, "0");

// "8 oct. 2026"
export const formatDia = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}. ${d.getFullYear()}`;
};

// "14:30"
export const formatHora = (iso: string) => {
  const d = new Date(iso);
  return `${dos(d.getHours())}:${dos(d.getMinutes())}`;
};

// "8 oct. 2026 · 14:30"
export const formatFecha = (iso: string) => `${formatDia(iso)} · ${formatHora(iso)}`;
