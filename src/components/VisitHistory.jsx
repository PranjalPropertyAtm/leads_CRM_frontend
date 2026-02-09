
import { motion } from "framer-motion";
import { X, Calendar, User } from "lucide-react";
import { useLeadVisits } from "../hooks/useVisitQueries";
import { formatDate } from "../utils/dateFormat";

export default function VisitHistory({ open, onClose, leadId }) {
  const { data: visits = [], isLoading } = useLeadVisits(leadId);

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

              return (
                <div key={v._id} className="border rounded-lg p-4">
                  {/* Top Row */}
                  <div className="flex justify-between">
                    <p className="font-semibold">
                      <Calendar size={16} className="inline-block mr-1" />
                      {formatDate(v.visitDate)}
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

                  {/* COMMON FEEDBACK */}
                  {v.tenantFeedback && (
                    <p className="text-gray-700 mt-2">
                      <b>Feedback:</b> {v.tenantFeedback}
                    </p>
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
