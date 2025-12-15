


import React, { useState } from "react";
import { notify } from "../utils/toast";
import SearchableSelect from "./SearchableSelect";
import { useFetchEmployees } from "../hooks/useEmployeeQueries";
import { useAddVisit } from "../hooks/useVisitQueries";

export default function AddVisitModal({ open, onClose, lead }) {
  const [visitedBy, setVisitedBy] = useState("");

  // TENANT-only fields
  const [ownerName, setOwnerName] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [propertyDetails, setPropertyDetails] = useState("");

  // OWNER-only fields
  const [tenantName, setTenantName] = useState("");
  const [tenantRequirements, setTenantRequirements] = useState("");

  // Common optional field
  const [tenantFeedback, setTenantFeedback] = useState("");

  const isTenant = lead?.customerType === "tenant";
  const isOwner = lead?.customerType === "owner";

  const { data } = useFetchEmployees(1, 1000);
  const employees = data?.employees || [];

  const addVisitMutation = useAddVisit();

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: emp.name,
  }));

  if (!open) return null;

  const handleSubmit = () => {
    if (!visitedBy) return notify.error("Please select employee");

    // TENANT LEAD VALIDATION
    if (isTenant) {
      if (!ownerName.trim()) return notify.error("Owner name is required");
      if (!propertyLocation.trim()) return notify.error("Property location is required");
      if (!propertyDetails.trim()) return notify.error("Property details are required");
    }

    // OWNER LEAD VALIDATION
    if (isOwner) {
      if (!tenantName.trim()) return notify.error("Tenant name is required");
      if (!tenantRequirements.trim())
        return notify.error("Tenant requirements are required");
    }

    const payload = {
      leadId: lead._id,
      visitedBy,

      // TENANT-only
      ownerName: isTenant ? ownerName : undefined,
      propertyLocation: isTenant ? propertyLocation : undefined,
      propertyDetails: isTenant ? propertyDetails : undefined,

      // OWNER-only
      tenantName: isOwner ? tenantName : undefined,
      tenantRequirements: isOwner ? tenantRequirements : undefined,

      // Common field
      tenantFeedback,
    };

    addVisitMutation.mutate(payload, {
      onSuccess: () => {
        notify.success("Visit Added Successfully");
        onClose();
      },
      onError: (error) => {
        notify.error(error?.response?.data?.message || "Failed to add visit");
      },
    });
  };

  console.log("LEAD PASSED:", lead);


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl animate-fadeIn">
        
        <h2 className="text-xl font-semibold mb-4">
          Add Visit for {lead?.customerName || lead?.ownerName}
          <span className="text-gray-500 text-sm">
            {" "}
            ({lead.customerType.toUpperCase()})
          </span>
        </h2>

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

        {/* COMMON: Tenant Feedback */}
        <div className="mt-3">
          <label className="text-sm">Tenant Feedback (Optional)</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 mt-1"
            rows={2}
            value={tenantFeedback}
            onChange={(e) => setTenantFeedback(e.target.value)}
            placeholder="Example: Liked the property..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-5">
          <button className="px-4 py-2 border rounded-lg" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleSubmit}
          >
            Add Visit
          </button>
        </div>
      </div>
    </div>
  );
}
