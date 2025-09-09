export function startOfDayISO(d: Date) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt.toISOString();
}

export function endOfDayISO(d: Date) {
  const dt = new Date(d);
  dt.setHours(23, 59, 59, 999);
  return dt.toISOString();
}

export function formatDate(d: string | Date | null | undefined, locale: string = "es-CO") {
  if (!d) return "-"; // si viene null/undefined
  
  const date = typeof d === "string" ? new Date(d) : d;

  // Validar que sea una fecha válida
  if (isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
