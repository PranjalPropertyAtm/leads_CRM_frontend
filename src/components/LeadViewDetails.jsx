import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { getUploadsUrl } from "../lib/axios.js";
import { getRemarksList, getCustomerRemarksList } from "../hooks/useLeadQueries.js";
import { formatDate, formatTime } from "../utils/dateFormat.js";

function InfoRow({ label, value }) {
  return (
    <div className="py-2 border-b border-slate-100 last:border-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value ?? "—"}</p>
    </div>
  );
}

/**
 * Reusable View Details drawer for a lead. Renders nothing if lead is null.
 * @param {{ lead: object | null, onClose: function }} props
 */
export default function LeadViewDetails({ lead, onClose }) {
  if (!lead) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-5 shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold truncate">
                {lead.customerName || lead.ownerName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    lead.customerType === "tenant"
                      ? "bg-sky-500/20 text-sky-200"
                      : "bg-emerald-500/20 text-emerald-200"
                  }`}
                >
                  {lead.customerType === "tenant" ? "Tenant" : "Owner"}
                </span>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-slate-200">
                  {(lead.status ?? "new").replace(/_/g, " ")}
                </span>
                {lead.createdAt && (
                  <span className="text-slate-400 text-xs">
                    Created {formatDate(lead.createdAt)}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Lead Information */}
          <section className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 pt-4 pb-2">
              Lead Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 px-4 pb-4">
              <InfoRow label="Mobile" value={lead.mobileNumber} />
              <InfoRow label="Email" value={lead.email || "—"} />
              <InfoRow label="City" value={lead.city || "—"} />
              {lead.assignedTo && (
                <InfoRow
                  label="Assisted To"
                  value={
                    typeof lead.assignedTo === "string"
                      ? lead.assignedTo
                      : lead.assignedTo?.name || "—"
                  }
                />
              )}
              {lead.createdBy && (
                <InfoRow
                  label="Created By"
                  value={
                    typeof lead.createdBy === "string"
                      ? lead.createdBy
                      : lead.createdBy?.name || "—"
                  }
                />
              )}
              {lead.customerType === "tenant" && (
                <>
                  <InfoRow
                    label="Preferred Location"
                    value={
                      Array.isArray(lead.preferredLocation)
                        ? lead.preferredLocation.join(", ")
                        : lead.preferredLocation || "—"
                    }
                  />
                  <InfoRow label="Budget" value={lead.budget ? `₹${lead.budget}` : "—"} />
                </>
              )}
              {lead.customerType === "owner" && (
                <>
                  <InfoRow label="Property Location" value={lead.propertyLocation || "—"} />
                  <InfoRow label="Landmark" value={lead.landmark || "—"} />
                  <InfoRow label="Area" value={lead.area ? `${lead.area} sq ft` : "—"} />
                </>
              )}
              <InfoRow label="Property Type" value={lead.propertyType || "—"} />
              <InfoRow label="Sub Type" value={lead.subPropertyType || "—"} />
              <InfoRow label="Source" value={lead.source || "—"} />
            </div>
            {lead.requirements && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Requirements
                </p>
                <p className="text-sm text-slate-800 bg-white rounded-lg p-3 border border-slate-100">
                  {lead.requirements}
                </p>
              </div>
            )}
          </section>

          {/* Customer Remarks */}
          {getCustomerRemarksList(lead).length > 0 && (
            <section className="bg-amber-50/50 rounded-xl border border-amber-100 overflow-hidden">
              <h3 className="text-xs font-semibold text-amber-800/80 uppercase tracking-wider px-4 pt-4 pb-2">
                Customer Remarks
              </h3>
              <ul className="px-4 pb-4 space-y-2">
                {getCustomerRemarksList(lead).map((r, i) => (
                  <li
                    key={`cr-${i}`}
                    className="bg-white rounded-lg p-3 border-l-4 border-amber-400 text-sm"
                  >
                    <p className="text-slate-800">{r.text}</p>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {(r.addedBy?.name ?? "—")} · {r.addedAt ? formatDate(r.addedAt) : "—"} ·{" "}
                      {r.addedAt ? formatTime(r.addedAt) : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Internal Remarks (Customer Care) */}
          {getRemarksList(lead).length > 0 && (
            <section className="bg-blue-50/50 rounded-xl border border-blue-100 overflow-hidden">
              <h3 className="text-xs font-semibold text-blue-800/80 uppercase tracking-wider px-4 pt-4 pb-2">
                Internal Remarks (Customer Care)
              </h3>
              <ul className="px-4 pb-4 space-y-2">
                {getRemarksList(lead).map((r, i) => (
                  <li
                    key={`ir-${i}`}
                    className="bg-white rounded-lg p-3 border-l-4 border-blue-400 text-sm"
                  >
                    <p className="text-slate-800">{r.text}</p>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {(r.addedBy?.name ?? "—")} · {r.addedAt ? formatDate(r.addedAt) : "—"} ·{" "}
                      {r.addedAt ? formatTime(r.addedAt) : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Registration */}
          <section
            className={`rounded-xl border overflow-hidden ${
              lead?.isRegistered || lead?.registrationDetails?.planName
                ? "bg-emerald-50/50 border-emerald-100"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 pt-4 pb-2">
              Registration
            </h3>
            {lead?.isRegistered || lead?.registrationDetails?.planName ? (
              <div className="px-4 pb-4 space-y-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <InfoRow label="Plan" value={lead.registrationDetails?.planName} />
                  <InfoRow
                    label={
                      lead.registrationDetails?.planName === "Customized"
                        ? "Customized Code"
                        : "Member Code"
                    }
                    value={
                      lead.registrationDetails?.planName === "Customized"
                        ? lead.registrationDetails?.customizedCode || "—"
                        : lead.registrationDetails?.memberCode || "—"
                    }
                  />
                  {lead.registrationDetails?.planName !== "Customized" && (
                    <>
                      <InfoRow
                        label="Reg. Date"
                        value={
                          lead.registrationDetails?.registrationDate
                            ? formatDate(lead.registrationDetails.registrationDate)
                            : "—"
                        }
                      />
                      <InfoRow
                        label="Registered By"
                        value={lead.registrationDetails?.registeredBy?.name || "—"}
                      />
                    </>
                  )}
                </div>
                {lead.registrationDetails?.paymentScreenshot && (
                  <div className="pt-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                      Payment Screenshot
                    </p>
                    <a
                      href={getUploadsUrl(lead.registrationDetails.paymentScreenshot)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-slate-200 overflow-hidden bg-white hover:shadow-md transition max-w-[200px]"
                    >
                      <img
                        src={getUploadsUrl(lead.registrationDetails.paymentScreenshot)}
                        alt="Payment"
                        className="w-full h-auto max-h-40 object-contain"
                      />
                    </a>
                    <p className="text-xs text-slate-500 mt-1">Click to open</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 pb-4">
                <p className="text-sm text-slate-600 font-medium">Not registered yet</p>
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </div>
  );
}
