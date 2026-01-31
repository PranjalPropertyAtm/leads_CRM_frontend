/**
 * Format a date value as dd/mm/yyyy (used consistently across the app).
 * @param {string|Date|number} value - Date string, Date object, or timestamp
 * @returns {string} Formatted date "dd/mm/yyyy" or "" if invalid
 */
export function formatDate(value) {
  if (value == null || value === "") return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date with long month name (e.g. "25 December 2024") - for display where needed.
 * @param {string|Date|number} value
 * @returns {string}
 */
export function formatDateLong(value) {
  if (value == null || value === "") return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
