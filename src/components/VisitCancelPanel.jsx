import React, { useState } from "react";
import { Ban } from "lucide-react";
import { notify } from "../utils/toast";
import { useCancelVisit } from "../hooks/useVisitQueries";
import { canCancelVisit } from "../utils/visitStatus";
import { canUserEditVisit } from "./VisitFeedbackEditor.jsx";

export default function VisitCancelPanel({
  visit,
  user,
  onCancelled,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const mutation = useCancelVisit();

  if (!visit?._id || !canUserEditVisit(user, visit) || !canCancelVisit(visit)) {
    return null;
  }

  const handleConfirm = () => {
    mutation.mutate(
      { visitId: visit._id, cancellationReason: reason },
      {
        onSuccess: (res) => {
          notify.success("Visit marked as cancelled");
          setOpen(false);
          setReason("");
          onCancelled?.(res?.data);
        },
        onError: (err) =>
          notify.error(
            err?.response?.data?.message || "Could not cancel visit"
          ),
      }
    );
  };

  return (
    <div className={className}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 border border-amber-200 rounded-lg px-3 py-1.5 bg-amber-50"
        >
          <Ban size={16} />
          Cancel this visit
        </button>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-800">
            Cancel this planned visit?
          </p>
          {/* <p className="text-xs text-gray-600">
            Use this if the visit did not happen (weather, client rescheduled,
            property unavailable, etc.). The lead status and visit count will
            update. Visits that already have feedback cannot be cancelled here.
          </p> */}
          <div>
            <label className="text-xs font-medium text-gray-700">
              Reason (Required)
            </label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Owner asked to reschedule"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold bg-amber-700 hover:bg-amber-800 disabled:opacity-60"
            >
              {mutation.isPending ? "Saving…" : "Yes, mark cancelled"}
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => {
                setOpen(false);
                setReason("");
              }}
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 bg-white"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
