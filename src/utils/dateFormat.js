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

/**
 * Format 24-hour time "HH:mm" as 12-hour "h:mm AM/PM" for display.
 * @param {string} time24 - "HH:mm" or "H:mm"
 * @returns {string} e.g. "2:30 PM" or "" if invalid
 */
export function formatTime24To12(time24) {
  if (!time24 || typeof time24 !== "string") return "";
  const parts = time24.trim().split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) || 0;
  if (Number.isNaN(h)) return "";
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const minStr = String(m).padStart(2, "0");
  return `${hour12}:${minStr} ${period}`;
}

/**
 * Convert 12-hour (hour 1-12, period AM/PM) + minutes to 24h "HH:mm".
 * @param {number} hour12 - 1 to 12
 * @param {number} minute - 0 to 59
 * @param {string} period - "AM" or "PM"
 * @returns {string} "HH:mm"
 */
export function time12To24(hour12, minute, period) {
  let h = Number(hour12) || 12;
  const m = Math.min(59, Math.max(0, Number(minute) || 0));
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
