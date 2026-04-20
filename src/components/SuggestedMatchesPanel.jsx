import React, { useState } from "react";
import { GitMerge, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { useSuggestedMatches } from "../hooks/useLeadQueries";
import axios from "../lib/axios.js";
import { notify } from "../utils/toast.js";
import LeadViewDetails from "./LeadViewDetails.jsx";

function matchLeadTitle(lead) {
  if (!lead) return "—";
  if (lead.customerType === "tenant") return lead.customerName?.trim() || "Tenant lead";
  return lead.ownerName?.trim() || "Owner lead";
}

function matchLeadLocation(lead) {
  if (!lead) return "—";
  if (lead.customerType === "tenant") {
    const p = lead.preferredLocation;
    if (Array.isArray(p) && p.length) return p.filter(Boolean).join(", ");
    if (typeof p === "string" && p.trim()) return p.trim();
    return lead.city?.trim() || "—";
  }
  const parts = [lead.propertyLocation, lead.area, lead.city].filter(
    (x) => x && String(x).trim()
  );
  return parts.length ? parts.join(" · ") : "—";
}

function matchPercentStyles(pct) {
  const p = Number(pct);
  if (!Number.isFinite(p)) return "bg-slate-100 text-slate-700 border-slate-200";
  if (p >= 72) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (p >= 48) return "bg-blue-100 text-blue-800 border-blue-200";
  if (p >= 25) return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-amber-50 text-amber-900 border-amber-200";
}

/**
 * @param {{
 *   leadId: string,
 *   enabled?: boolean,
 *   compact?: boolean,
 *   embedded?: boolean,
 *   hideHeader?: boolean,
 * }} props
 */
export default function SuggestedMatchesPanel({
  leadId,
  enabled = true,
  compact,
  embedded,
  hideHeader,
}) {
  const [detailLead, setDetailLead] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useSuggestedMatches(leadId, {
    enabled: Boolean(leadId) && enabled,
    limit: 10,
  });

  const matches = data?.matches ?? [];
  const oppositeLabel =
    data?.sourceCustomerType === "tenant"
      ? "owner"
      : data?.sourceCustomerType === "owner"
        ? "tenant"
        : "opposite";

  const openLeadDetails = async (id) => {
    if (!id || detailLoadingId) return;
    setDetailLoadingId(id);
    try {
      const res = await axios.get(`/leads/${id}`);
      if (!res.data?.success || !res.data?.data) {
        notify.error(res.data?.message || "Could not load lead");
        return;
      }
      setDetailLead(res.data.data);
    } catch (err) {
      notify.error(err?.response?.data?.message || "Could not load lead");
    } finally {
      setDetailLoadingId(null);
    }
  };

  const shellClass = embedded
    ? "p-0 mt-0 border-0 shadow-none bg-transparent"
    : `rounded-xl border border-slate-200 bg-white ${compact ? "p-4 mt-4" : "p-6 mt-6 shadow-sm"}`;

  return (
    <div className={shellClass}>
      {!hideHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <GitMerge size={compact ? 18 : 22} />
            </div>
            <div>
              <h2 className={`font-semibold text-slate-800 ${compact ? "text-base" : "text-lg"}`}>
                Suggested matches
              </h2>
              {/* <p className="text-xs text-slate-500">
                Sorted by full match on location, then budget, then full match on sub-property type, then match
                strength. Only {oppositeLabel} leads you can access (not closed / lost).
              </p> */}
              {/* <p className="text-xs text-slate-400 mt-1">
                Match % is an estimate out of 100 from the same signals (location, budget, sub-type, and more)—not a
                guarantee.
              </p> */}
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      )}

      {hideHeader && (
        <p className="text-xs text-slate-400 mb-3">
          Match % is estimated out of 100 from multiple factors (same order as sort).
        </p>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-slate-500 py-6 justify-center">
          <Loader2 className="animate-spin" size={22} />
          <span>Finding matches…</span>
        </div>
      )}

      {isError && (
        <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 flex items-center gap-2">
          <AlertTriangle size={18} />
          {error?.response?.data?.message || error?.message || "Could not load matches"}
        </div>
      )}

      {!isLoading && !isError && matches.length === 0 && (
        <p className="text-sm text-slate-500 py-2">
          No active {oppositeLabel} leads found with the same property type, or none in your access scope.
        </p>
      )}

      {!isLoading && !isError && matches.length > 0 && (
        <ul className="space-y-3">
          {matches.map((row) => {
            const lead = row.lead;
            const id = lead?._id;
            if (!id) return null;
            return (
              <li
                key={String(id)}
                className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900 truncate">{matchLeadTitle(lead)}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${matchPercentStyles(
                        row.matchPercent
                      )}`}
                      title="Estimated match with your lead, out of 100"
                    >
                      {Number.isFinite(row.matchPercent) ? row.matchPercent : 0}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{matchLeadLocation(lead)}</p>
                  {lead.propertyType && (
                    <p className="text-xs text-slate-500 mt-1">
                      {lead.propertyType}
                      {lead.subPropertyType ? ` · ${lead.subPropertyType}` : ""}
                      {lead.budget ? ` · Budget ${lead.budget}` : ""}
                    </p>
                  )}
                  {Array.isArray(row.reasons) && row.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {row.reasons.map((r) => (
                        <span
                          key={r}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                  {Array.isArray(row.warnings) && row.warnings.length > 0 && (
                    <ul className="mt-2 text-xs text-amber-800 space-y-0.5">
                      {row.warnings.map((w) => (
                        <li key={w} className="flex gap-1.5">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openLeadDetails(id)}
                  disabled={detailLoadingId === id}
                  className="shrink-0 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  {detailLoadingId === id ? "Loading…" : "Show details"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <LeadViewDetails
        lead={detailLead}
        onClose={() => setDetailLead(null)}
        overlayZClass="z-[100100]"
      />
    </div>
  );
}
