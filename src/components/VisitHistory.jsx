import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar, User, MessageSquarePlus } from "lucide-react";
import { useLeadVisits } from "../hooks/useVisitQueries";
import { formatDate, formatDateTime } from "../utils/dateFormat";
import { useLoadUser } from "../hooks/useAuthQueries";
import VisitFeedbackEditor, {
  canUserEditVisit,
} from "./VisitFeedbackEditor.jsx";
import VisitCancelPanel from "./VisitCancelPanel.jsx";
import {
  getVisitOutcome,
  isVisitCancelled,
  isVisitFeedbackFinalized,
} from "../utils/visitStatus";

export default function VisitHistory({ open, onClose, leadId }) {
  const { data: visits = [], isLoading } = useLeadVisits(leadId);
  const { data: user } = useLoadUser();
  const [editingVisitId, setEditingVisitId] = useState(null);

  useEffect(() => {
    if (!open) setEditingVisitId(null);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl w-full max-w-xl h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Visit History</h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {isLoading ? (
          <p className="mt-4 text-gray-500">Loading...</p>
        ) : visits.length === 0 ? (
          <p className="text-gray-500 mt-4">No visits recorded.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {visits.map((v) => {
              const visitedByName =
                typeof v.visitedBy === "string"
                  ? "Unknown"
                  : v.visitedBy?.name || "Unknown";

              const leadType = v.lead?.customerType; // 🔥 Important
              const isTenant = leadType === "tenant";
              const isOwner = leadType === "owner";
              const outcome = getVisitOutcome(v);

              return (
                <div
                  key={v._id}
                  className={`border rounded-lg p-4 ${
                    outcome === "cancelled" ? "bg-gray-50 border-dashed" : ""
                  }`}
                >
                  {/* Top Row */}
                  <div className="flex justify-between flex-wrap gap-2">
                    <p className="font-semibold flex flex-wrap items-center gap-2">
                      <Calendar size={16} className="inline-block mr-1" />
                      {formatDate(v.visitDate)}
                      {outcome === "cancelled" && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-800">
                          Cancelled
                        </span>
                      )}
                      {outcome === "completed" && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      )}
                      {outcome === "scheduled" && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          Planned
                        </span>
                      )}
                    </p>

                    <p className="text-sm flex items-center gap-1">
                      <User size={16} /> {visitedByName}
                    </p>
                  </div>

                  {/* Lead created by / Visit added by */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                    <span>
                      Lead created by: {typeof v.leadCreatedBy === "object" && v.leadCreatedBy?.name ? v.leadCreatedBy.name : "—"}
                    </span>
                    <span>
                      Visit added by: {typeof v.visitAddedBy === "object" && v.visitAddedBy?.name ? v.visitAddedBy.name : "—"}
                    </span>
                    {v.createdAt && (
                      <span>
                        Visit logged at: {formatDateTime(v.createdAt)}
                      </span>
                    )}
                  </div>

                  {/* ------------------------------ */}
                  {/* TENANT LEAD VISITS */}
                  {/* ------------------------------ */}
                  {isTenant && (
                    <>
                      <p className="text-gray-700 mt-2">
                        <b>Owner Name:</b> {v.ownerName || "N/A"}
                      </p>

                      <p className="text-gray-700 mt-1">
                        <b>Property Location:</b>{" "}
                        {v.propertyLocation || "N/A"}
                      </p>

                      <p className="text-gray-700 mt-1">
                        <b>Property Details:</b>{" "}
                        {v.propertyDetails || "N/A"}
                      </p>
                    </>
                  )}

                  {/* ------------------------------ */}
                  {/* OWNER LEAD VISITS */}
                  {/* ------------------------------ */}
                  {isOwner && (
                    <>
                      <p className="text-gray-700 mt-2">
                        <b>Tenant Name:</b> {v.tenantName || "N/A"}
                      </p>

                      <p className="text-gray-700 mt-1">
                        <b>Tenant Requirements:</b>{" "}
                        {v.tenantRequirements || "N/A"}
                      </p>
                    </>
                  )}

                  {/* FEEDBACK */}
                  {v.tenantFeedback && (
                    <p className="text-gray-700 mt-2">
                      <b>Feedback:</b> {v.tenantFeedback}
                    </p>
                  )}
                  {isVisitFeedbackFinalized(v) && !isVisitCancelled(v) && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Feedback submitted
                      {v.feedbackAddedAt ? ` on ${formatDateTime(v.feedbackAddedAt)}` : ""} — cannot be edited.
                    </p>
                  )}

                  {isVisitCancelled(v) && (
                    <div className="mt-3 text-sm text-gray-700 space-y-1 rounded-lg border border-gray-200 bg-white/80 p-3">
                      {v.cancellationReason && (
                        <p>
                          <b>Cancellation reason:</b> {v.cancellationReason}
                        </p>
                      )}
                      {v.cancelledAt && (
                        <p className="text-xs text-gray-500">
                          Cancelled on {formatDateTime(v.cancelledAt)}
                          {typeof v.cancelledBy === "object" &&
                            v.cancelledBy?.name && (
                              <> · by {v.cancelledBy.name}</>
                            )}
                        </p>
                      )}
                    </div>
                  )}

                  <VisitCancelPanel visit={v} user={user} className="mt-3" />

                  {canUserEditVisit(user, v) &&
                    !isVisitCancelled(v) &&
                    !isVisitFeedbackFinalized(v) && (
                    <div className="mt-3">
                      {editingVisitId === v._id ? (
                        <VisitFeedbackEditor
                          visit={v}
                          user={user}
                          onSaved={() => setEditingVisitId(null)}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingVisitId((id) =>
                              id === v._id ? null : v._id
                            )
                          }
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          <MessageSquarePlus size={16} />
                          Add feedback
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
