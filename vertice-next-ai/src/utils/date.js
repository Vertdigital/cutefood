// Utilitários para trabalhar com a data do evento (armazenada em ISO "AAAA-MM-DD").

const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function parseDataEvento(isoDate) {
  if (!isoDate) return null;
  return new Date(`${isoDate}T00:00:00`);
}

/** Retorna algo como "20 de setembro". */
export function formatDataCompleta(isoDate) {
  const d = parseDataEvento(isoDate);
  if (!d) return "A definir";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

/** Retorna algo como "20 set". */
export function formatDataCurta(isoDate) {
  const d = parseDataEvento(isoDate);
  if (!d) return "—";
  return `${String(d.getDate()).padStart(2, "0")} ${MESES_ABREV[d.getMonth()]}`;
}

/** Retorna { dia, mes } onde mes é a abreviação em minúsculas (ex: "set"). */
export function getDiaMes(isoDate) {
  const d = parseDataEvento(isoDate);
  if (!d) return { dia: null, mes: null };
  return { dia: d.getDate(), mes: MESES_ABREV[d.getMonth()] };
}
