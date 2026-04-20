import React from "react";
import { X, RefreshCw } from "lucide-react";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import SuggestedMatchesPanel from "./SuggestedMatchesPanel";

export default function SuggestedMatchesModal({ open, onClose, lead }) {
  const queryClient = useQueryClient();
  const leadId = lead?._id;
  const fetching = useIsFetching({ queryKey: ["lead-suggested-matches", leadId] }) > 0;

  if (!open || !leadId) return null;

  const title = lead.customerType === "tenant" ? lead.customerName || "Tenant" : lead.ownerName || "Owner";

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["lead-suggested-matches", leadId] });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-slate-50 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="suggested-matches-modal-title"
      >
        <div className="flex-shrink-0 flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-white">
          <div className="min-w-0">
            <h2 id="suggested-matches-modal-title" className="text-lg font-semibold text-slate-800">
              Suggested matches
            </h2>
            <p className="text-sm text-slate-500 truncate">
              {title}
              <span className="text-slate-400"> · {lead.customerType}</span>
            </p>
            {/* <p className="text-xs text-slate-400 mt-0.5">
              Sort: full location → budget → full sub-property → strength. Each row shows estimated match % (0–100).
            </p> */}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={fetching}
              className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={20} className={fetching ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SuggestedMatchesPanel leadId={leadId} enabled={open} embedded hideHeader />
        </div>
      </div>
    </div>
  );
}
