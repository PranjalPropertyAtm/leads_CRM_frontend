/**
 * Align with backend: scheduled | completed | cancelled, with legacy inference.
 */
export function getVisitOutcome(visit) {
  if (!visit) return "scheduled";
  if (visit.visitOutcome === "cancelled") return "cancelled";
  if (visit.visitOutcome === "completed") return "completed";
  if (visit.visitOutcome === "scheduled") return "scheduled";
  if (visit.tenantFeedback && String(visit.tenantFeedback).trim()) {
    return "completed";
  }
  return "scheduled";
}

export function isVisitCancelled(visit) {
  return getVisitOutcome(visit) === "cancelled";
}

/** Only planned (not happened / no feedback) visits can be cancelled */
export function canCancelVisit(visit) {
  return getVisitOutcome(visit) === "scheduled";
}

/**
 * Post-visit feedback is locked after first submit (visitOutcome completed).
 * Optional note when logging the visit does not lock (outcome stays scheduled).
 * Legacy: no visitOutcome but has feedback → treat as finalized.
 */
export function isVisitFeedbackFinalized(visit) {
  if (!visit) return false;
  if (visit.visitOutcome === "completed") return true;
  const hasOutcome =
    visit.visitOutcome === "scheduled" ||
    visit.visitOutcome === "cancelled" ||
    visit.visitOutcome === "completed";
  if (!hasOutcome && visit.tenantFeedback && String(visit.tenantFeedback).trim()) {
    return true;
  }
  return false;
}
