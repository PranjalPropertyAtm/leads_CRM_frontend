import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Building2,
  Calendar,
  ClipboardList,
  MessageSquare,
  Users,
  Ban,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatDate, formatDateTime } from "../utils/dateFormat";
import { useLoadUser } from "../hooks/useAuthQueries";
import VisitFeedbackEditor from "./VisitFeedbackEditor";
import VisitCancelPanel from "./VisitCancelPanel.jsx";
import {
  getVisitOutcome,
  isVisitCancelled,
  isVisitFeedbackFinalized,
} from "../utils/visitStatus";

function statusBadgeClasses(outcome) {
  if (outcome === "cancelled")
    return "bg-amber-100 text-amber-900 ring-amber-200/60";
  if (outcome === "completed")
    return "bg-emerald-100 text-emerald-900 ring-emerald-200/60";
  return "bg-indigo-100 text-indigo-900 ring-indigo-200/60";
}

function SectionCard({ icon: Icon, title, children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Icon size={16} strokeWidth={2} />
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, fullWidth = false }) {
  if (value === null || value === undefined || value === "") {
    value = "—";
  }
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4 py-2.5 border-b border-gray-50 last:border-0 ${
        fullWidth ? "sm:flex-col" : ""
      }`}
    >
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 sm:w-[38%] shrink-0 pt-0.5">
        {label}
      </dt>
      <dd
        className={`text-sm text-gray-900 font-medium leading-relaxed ${
          fullWidth ? "sm:w-full whitespace-pre-wrap" : "sm:flex-1 sm:text-left"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function VisitDetailsModal({
  open,
  onClose,
  visit,
  onVisitUpdated,
}) {
  const { data: user } = useLoadUser();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open || !visit) return null;

  const isTenantLead = visit?.lead?.customerType === "tenant";
  const isOwnerLead = visit?.lead?.customerType === "owner";
  const outcome = getVisitOutcome(visit);
  const statusLabel =
    outcome === "cancelled"
      ? "Cancelled"
      : outcome === "completed"
        ? "Completed"
        : "Planned";

  const leadName =
    visit?.lead?.customerName || visit?.lead?.ownerName || "Lead";
  const customerType = (visit?.lead?.customerType || "").toUpperCase();

  const StatusIcon =
    outcome === "cancelled" ? Ban : outcome === "completed" ? CheckCircle2 : Clock;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visit-details-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="w-full max-w-2xl max-h-[min(90vh,880px)] flex flex-col rounded-2xl shadow-2xl shadow-slate-900/15 border border-gray-200/90 bg-white overflow-hidden"
      >
        {/* Header */}
        <div className="relative shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 sm:px-6 pt-5 pb-6 text-white">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>

          <p
            id="visit-details-title"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1"
          >
            Visit details
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white pr-10">
            {leadName}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {customerType && (
              <span className="inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100 ring-1 ring-white/15">
                {customerType}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClasses(
                outcome
              )}`}
            >
              <StatusIcon size={14} className="shrink-0 opacity-90" />
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-50/90 p-4 sm:p-5 space-y-4">
          <SectionCard icon={Building2} title="Lead overview">
            <dl>
              <DetailRow label="Lead name" value={leadName} />
              <DetailRow label="City" value={visit?.lead?.city} />
              {isOwnerLead && (
                <>
                  <DetailRow
                    label="Property location"
                    value={visit?.lead?.propertyLocation}
                  />
                  <DetailRow
                    label="Property type"
                    value={
                      [visit?.lead?.propertyType, visit?.lead?.subPropertyType]
                        .filter(Boolean)
                        .join(" / ") || "—"
                    }
                  />
                  <DetailRow
                    label="Registered"
                    value={
                      visit?.lead?.isRegistered === true ? "Yes" : "No"
                    }
                  />
                </>
              )}
              {isTenantLead && (
                <>
                  <DetailRow
                    label="Preferred locations"
                    value={
                      Array.isArray(visit?.lead?.preferredLocation) &&
                      visit.lead.preferredLocation.length > 0
                        ? visit.lead.preferredLocation.join(", ")
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Requirements"
                    value={visit?.lead?.requirements}
                    fullWidth
                  />
                  <DetailRow
                    label="Registered"
                    value={
                      visit?.lead?.isRegistered === true ? "Yes" : "No"
                    }
                  />
                </>
              )}
            </dl>
          </SectionCard>

          <SectionCard icon={Calendar} title="Visit record">
            <dl>
              <DetailRow
                label="Visit date"
                value={formatDate(visit.visitDate)}
              />
              <DetailRow
                label="Visit added at"
                value={visit.createdAt ? formatDateTime(visit.createdAt) : "—"}
              />
              <DetailRow label="Status" value={statusLabel} />
              {isTenantLead && (
                <>
                  <DetailRow label="Owner name" value={visit.ownerName} />
                  <DetailRow
                    label="Property location"
                    value={visit.propertyLocation}
                  />
                  <DetailRow
                    label="Property details"
                    value={visit.propertyDetails}
                    fullWidth
                  />
                </>
              )}
              {isOwnerLead && (
                <>
                  <DetailRow label="Tenant name" value={visit.tenantName} />
                  <DetailRow
                    label="Tenant requirements"
                    value={visit.tenantRequirements}
                    fullWidth
                  />
                </>
              )}
              {visit.tenantFeedback && !isVisitCancelled(visit) && (
                <div className="pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Feedback
                  </p>
                  <div className="rounded-lg border border-gray-100 bg-slate-50/80 px-3 py-3 text-sm text-gray-800 leading-relaxed">
                    {visit.tenantFeedback}
                  </div>
                  {visit.feedbackAddedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Submitted at {formatDateTime(visit.feedbackAddedAt)}
                    </p>
                  )}
                </div>
              )}
              {!visit.tenantFeedback && !isVisitCancelled(visit) && (
                <DetailRow label="Feedback" value="Not submitted yet" />
              )}
              {isVisitCancelled(visit) && (
                <>
                  <DetailRow
                    label="Cancellation reason"
                    value={visit.cancellationReason}
                    fullWidth
                  />
                  <DetailRow
                    label="Cancelled on"
                    value={
                      visit.cancelledAt
                        ? formatDateTime(visit.cancelledAt)
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Cancelled by"
                    value={
                      typeof visit.cancelledBy === "object"
                        ? visit.cancelledBy?.name
                        : "—"
                    }
                  />
                </>
              )}
            </dl>
          </SectionCard>

          <SectionCard icon={Users} title="Team">
            <dl>
              <DetailRow
                label="Visited by"
                value={visit?.visitedBy?.name}
              />
              <DetailRow
                label="Lead created by"
                value={visit?.leadCreatedBy?.name}
              />
              <DetailRow
                label="Visit added by"
                value={visit?.visitAddedBy?.name}
              />
            </dl>
          </SectionCard>

          {/* Actions */}
          <div className="rounded-xl border border-dashed border-gray-300 bg-white/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <ClipboardList size={18} className="text-blue-600" />
              Actions
            </div>
            <VisitCancelPanel
              visit={visit}
              user={user}
              onCancelled={(v) => v && onVisitUpdated?.(v)}
            />
            {isVisitFeedbackFinalized(visit) && !isVisitCancelled(visit) && (
              <div className="flex items-start gap-2 rounded-lg bg-slate-100/80 border border-slate-200/80 px-3 py-2.5 text-xs text-slate-700">
                <MessageSquare
                  size={16}
                  className="text-slate-500 shrink-0 mt-0.5"
                />
                <span>
                  Feedback {visit.feedbackAddedAt ? `submitted on ${formatDateTime(visit.feedbackAddedAt)}` : "submitted"} for this visit and cannot be changed.
                </span>
              </div>
            )}
            <VisitFeedbackEditor
              visit={visit}
              user={user}
              className="rounded-lg border border-gray-200 bg-white shadow-none"
              onSaved={(updatedVisit) => {
                if (updatedVisit) onVisitUpdated?.(updatedVisit);
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
