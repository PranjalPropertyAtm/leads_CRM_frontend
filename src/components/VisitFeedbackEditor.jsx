import React, { useEffect, useState } from "react";
import { notify } from "../utils/toast";
import { useUpdateVisitFeedback } from "../hooks/useVisitQueries";
import { isVisitCancelled, isVisitFeedbackFinalized } from "../utils/visitStatus";
import { cn } from "../lib/utils";

function isCustomerCareUser(user) {
  if (!user) return false;
  if (user.role === "customer_care_executive") return true;
  const d = user.designation;
  return typeof d === "string" && d.toLowerCase().includes("customer care");
}

export function canUserEditVisit(user, visit) {
  if (!user?._id || !visit) return false;
  if (user.role === "admin") return true;
  if (isCustomerCareUser(user)) return true;
  const perms = user.permissions || [];
  if (perms.includes("visits:edit")) return true;
  const uid = String(user._id);
  const vBy =
    typeof visit.visitedBy === "object"
      ? visit.visitedBy?._id
      : visit.visitedBy;
  const aBy =
    typeof visit.visitAddedBy === "object"
      ? visit.visitAddedBy?._id
      : visit.visitAddedBy;
  return String(vBy) === uid || String(aBy) === uid;
}

/**
 * One-time feedback after the visit (cannot be edited after save).
 */
export default function VisitFeedbackEditor({
  visit,
  user,
  onSaved,
  className = "",
}) {
  const [tenantFeedback, setTenantFeedback] = useState(
    visit?.tenantFeedback || ""
  );

  useEffect(() => {
    setTenantFeedback(visit?.tenantFeedback || "");
  }, [visit?._id, visit?.tenantFeedback]);

  const mutation = useUpdateVisitFeedback();

  if (!visit?._id || !canUserEditVisit(user, visit)) return null;
  if (isVisitCancelled(visit)) return null;
  if (isVisitFeedbackFinalized(visit)) return null;

  const handleSave = () => {
    if (!tenantFeedback.trim()) {
      notify.error("Please enter feedback before saving");
      return;
    }
    mutation.mutate(
      {
        visitId: visit._id,
        payload: { tenantFeedback },
      },
      {
        onSuccess: (res) => {
          notify.success("Feedback saved");
          onSaved?.(res?.data);
        },
        onError: (err) =>
          notify.error(
            err?.response?.data?.message || "Could not save feedback"
          ),
      }
    );
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-blue-100 bg-blue-50/50 p-4 space-y-3",
        className
      )}
    >
      <h4 className="text-sm font-semibold text-gray-800">
        Add feedback
      </h4>
      {/* <p className="text-xs text-gray-600">
        Submit once after the visit — feedback cannot be changed later. This also
        marks the lead as <strong>Visit completed</strong> (unless the deal is
        closed or lost).
      </p> */}

      <div>
        {/* <label className="text-xs font-medium text-gray-700">Feedback</label> */}
        <textarea
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
          rows={3}
          value={tenantFeedback}
          onChange={(e) => setTenantFeedback(e.target.value)}
          placeholder="What happened on the visit? Tenant / owner reaction…"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={mutation.isPending}
        className="w-full sm:w-auto px-4 py-2 rounded-lg text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
      >
        {mutation.isPending ? "Saving…" : "Save feedback"}
      </button>
    </div>
  );
}
