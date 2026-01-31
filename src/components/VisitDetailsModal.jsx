

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { formatDate } from "../utils/dateFormat";

export default function VisitDetailsModal({ open, onClose, visit }) {
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

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-6 overflow-y-auto max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Visit Details
            </h2>
            <p className="text-sm text-gray-500">
              {visit?.lead?.customerName ||
                visit?.lead?.ownerName ||
                "Lead"}{" "}
              • {visit?.lead?.customerType?.toUpperCase()}
            </p>
          </div>

          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={26} />
          </button>
        </div>

        {/* LEAD INFO */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Lead Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info
              label="Lead Name"
              value={
                visit?.lead?.customerName ||
                visit?.lead?.ownerName ||
                "N/A"
              }
            />
            <Info
              label="Customer Type"
              value={visit?.lead?.customerType || "N/A"}
            />
            <Info label="City" value={visit?.lead?.city || "N/A"} />
          </div>
        </div>

        {/* VISIT INFO */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Visit Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info
              label="Visit Date"
              value={formatDate(visit.visitDate)}
            />

            {/* -------- TENANT LEAD VISIT -------- */}
            {isTenantLead && (
              <>
                <Info
                  label="Owner Name"
                  value={visit.ownerName || "N/A"}
                />
                <Info
                  label="Property Location"
                  value={visit.propertyLocation || "N/A"}
                />
                <Info
                  label="Property Details"
                  value={visit.propertyDetails || "N/A"}
                />
              </>
            )}

            {/* -------- OWNER LEAD VISIT -------- */}
            {isOwnerLead && (
              <>
                <Info
                  label="Tenant Name"
                  value={visit.tenantName || "N/A"}
                />
                <Info
                  label="Tenant Requirements"
                  value={visit.tenantRequirements || "N/A"}
                />
              </>
            )}

            {/* COMMON */}
            <Info
              label="Tenant Feedback"
              value={visit.tenantFeedback || "N/A"}
            />
          </div>
        </div>

        {/* EMPLOYEE INFO */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Visited By
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info
              label="Employee Name"
              value={visit?.visitedBy?.name || "N/A"}
            />
            <Info
              label="Employee Email"
              value={visit?.visitedBy?.email || "N/A"}
            />
            <Info
              label="Role"
              value={visit?.visitedBy?.role || "N/A"}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}
