import { formatDate } from "./dateFormat";

/**
 * Get remaining days until expected closure (negative = overdue).
 * @param {string|Date} expectedClosureDate
 * @param {Date} [asOf]
 * @returns {number|null}
 */
export function getRemainingDays(expectedClosureDate, asOf = new Date()) {
  if (!expectedClosureDate) return null;
  const expected = new Date(expectedClosureDate);
  expected.setHours(0, 0, 0, 0);
  const today = new Date(asOf);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expected - today) / (24 * 60 * 60 * 1000));
}

/**
 * Countdown text: "3 days left", "Overdue by 2 days", or "—" if no expected date.
 * @param {object} lead - { expectedClosureDate, dealClosed, status }
 * @returns {string}
 */
export function getCountdownText(lead) {
  if (lead?.dealClosed || lead?.status === "deal_closed") return "Closed";
  const expected = lead?.expectedClosureDate;
  if (!expected) return "—";
  const days = getRemainingDays(expected);
  if (days === null) return "—";
  if (days < 0) return `by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""}`;
  if (days === 0) return "Due today";
  return `${days} day${days !== 1 ? "s" : ""} left`;
}

/**
 * Get the urgency label to display for a lead from remaining days.
 * Rules: overdue = Overdue; 0–3 = Critical; 4–7 = High; 8–14 = Medium; >14 = Low.
 */
export function getDisplayUrgencyLevel(lead) {
  if (lead?.dealClosed || lead?.status === "deal_closed" || lead?.status === "lost") return null;
  const remaining = getRemainingDays(lead?.expectedClosureDate);
  if (remaining === null) return lead?.urgencyLevel || null;
  if (remaining < 0) return "Overdue";
  if (remaining <= 3) return "Critical";  // 0–3 days = Critical
  if (remaining <= 7) return "High";      // 4–7 days = High
  if (remaining <= 14) return "Medium";   // 8–14 days = Medium
  return "Low";                            // >14 days = Low
}

/**
 * Urgency badge color classes (Tailwind).
 * Use "Overdue" for overdue leads so they don't show Critical/High badge.
 */
export const URGENCY_COLORS = {
  Low: "bg-gray-100 text-gray-700",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-red-100 text-red-800",
  Overdue: "bg-amber-100 text-amber-800",
};

/**
 * Format requirement duration for display: "30 days", "2 weeks", "1 month".
 */
export function formatRequirementDuration(duration) {
  if (!duration?.value) return "—";
  const v = duration.value;
  const u = duration.unit || "days";
  if (u === "days") return `${v} day${v !== 1 ? "s" : ""}`;
  if (u === "weeks") return `${v} week${v !== 1 ? "s" : ""}`;
  if (u === "months") return `${v} month${v !== 1 ? "s" : ""}`;
  return "—";
}
