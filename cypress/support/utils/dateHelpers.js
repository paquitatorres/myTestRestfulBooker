
//
// Funciones utilitarias puras para manejo de fechas.

/**
 * Convierte una fecha en formato dd/mm/yyyy (la que usa la UI)
 * al formato yyyy-mm-dd (la que usa la API en sus query params).
 *
 * @param {string} ddmmyyyy - Fecha en formato dd/mm/yyyy
 * @returns {string} Fecha en formato yyyy-mm-dd
 *
 * @example
 * toApiDateFormat('19/07/2026') // → '2026-07-19'
 */
export function toApiDateFormat(ddmmyyyy) {
  const [day, month, year] = ddmmyyyy.split('/');
  return `${year}-${month}-${day}`;
}