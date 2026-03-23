


import React, { useState } from "react";
import { localDateInputValue } from "../utils/dateFormat";
import { notify } from "../utils/toast";
import SearchableSelect from "./SearchableSelect";
import { useFetchEmployees } from "../hooks/useEmployeeQueries";
import { useAddVisit } from "../hooks/useVisitQueries";

export default function AddVisitModal({ open, onClose, lead }) {
  const [visitedBy, setVisitedBy] = useState("");
  const [visitDate, setVisitDate] = useState(() => localDateInputValue());

  // TENANT-only fields
  const [ownerName, setOwnerName] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [propertyDetails, setPropertyDetails] = useState("");

  // OWNER-only fields
  const [tenantName, setTenantName] = useState("");
  const [tenantRequirements, setTenantRequirements] = useState("");

  const isTenant = lead?.customerType === "tenant";
  const isOwner = lead?.customerType === "owner";

  const { data } = useFetchEmployees(1, 1000);
  const employees = data?.employees || [];

  const addVisitMutation = useAddVisit();

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: emp.name,
  }));

  // don't render until modal is open and lead is available
  if (!open || !lead) return null; 

  const handleSubmit = () => {
    if (addVisitMutation.isPending) return; // 🔒 HARD LOCK

    if (!visitedBy) return notify.error("Please select employee");

    if (isTenant) {
      if (!ownerName.trim()) return notify.error("Owner name required");
      if (!propertyLocation.trim())
        return notify.error("Property location required");
      if (!propertyDetails.trim())
        return notify.error("Property details required");
    }

    if (isOwner) {
      if (!tenantName.trim()) return notify.error("Tenant name required");
      if (!tenantRequirements.trim())
        return notify.error("Tenant requirements required");
    }

    addVisitMutation.mutate(
      {
        leadId: lead._id,
        visitedBy,
        visitDate: visitDate || undefined,
        ownerName: isTenant ? ownerName : undefined,
        propertyLocation: isTenant ? propertyLocation : undefined,
        propertyDetails: isTenant ? propertyDetails : undefined,
        tenantName: isOwner ? tenantName : undefined,
        tenantRequirements: isOwner ? tenantRequirements : undefined,
      },
      {
        onSuccess: (data) => {
          notify.success(
            data?.visitReminderCreated
              ? "Visit added. A reminder was created for the visit date."
              : "Visit Added Successfully"
          );
          onClose();
        },
        onError: (err) =>
          notify.error(err?.response?.data?.message || "Failed to add visit"),
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl animate-fadeIn">
        
        <h2 className="text-xl font-semibold mb-1">
          Add Visit — {lead?.customerName || lead?.ownerName}
          <span className="text-gray-500 text-sm">
            {" "}
            ({(lead?.customerType || "").toUpperCase()})
          </span>
        </h2>
        {/* <p className="text-sm text-gray-600 mb-4">
          Record the planned visit <strong>before you go</strong>. Feedback is
          optional here; after the visit, add feedback from{" "}
          <strong>Visit History</strong> on this lead.
        </p> */}

        {/* Employee Select */}
        <SearchableSelect
          label="Visited By"
          value={visitedBy}
          options={employeeOptions}
          onChange={(e) => setVisitedBy(e.target.value)}
        />

        {/* -------------------------------------- */}
        {/* TENANT LEAD FIELDS */}
        {/* -------------------------------------- */}
        {isTenant && (
          <>
            {/* Owner Name */}
            <div className="mt-2">
              <label className="text-sm">Owner Name (Required)</label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Example: Mr. Sharma"
              />
            </div>

            {/* Property Location */}
            <div className="mt-2">
              <label className="text-sm">Property Location (Required)</label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={propertyLocation}
                onChange={(e) => setPropertyLocation(e.target.value)}
                placeholder="Example: Andheri East"
              />
            </div>

            {/* Property Details */}
            <div className="mt-3">
              <label className="text-sm">Property Details (Required)</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 mt-1"
                rows={3}
                value={propertyDetails}
                onChange={(e) => setPropertyDetails(e.target.value)}
                placeholder="Example: 2BHK, Fully Furnished..."
              />
            </div>
          </>
        )}

        {/* -------------------------------------- */}
        {/* OWNER LEAD FIELDS */}
        {/* -------------------------------------- */}
        {isOwner && (
          <>
            <div className="mt-2">
              <label className="text-sm">Tenant Name (Required)</label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Example: Rohit Kumar"
              />
            </div>

            <div className="mt-3">
              <label className="text-sm">Tenant Requirements (Required)</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 mt-1"
                rows={2}
                value={tenantRequirements}
                onChange={(e) => setTenantRequirements(e.target.value)}
                placeholder="Example: Needs 2BHK near school"
              />
            </div>
          </>
        )}

        {/* Visit Date */}
        <div className="mt-3">
          <label className="text-sm">Visit Date</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-5">
          <button className="px-4 py-2 border rounded-lg" onClick={onClose}>
            Cancel
          </button>

         <button
            onClick={handleSubmit}
            disabled={addVisitMutation.isPending}
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2
              ${
                addVisitMutation.isPending
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {addVisitMutation.isPending ? "Adding..." : "Add Visit"}
          </button>
        </div>
      </div>
    </div>
  );
}
