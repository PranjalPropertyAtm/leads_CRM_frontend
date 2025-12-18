import React, { useState } from "react";
import { notify } from "../utils/toast";
import SearchableSelect from "./SearchableSelect";
import { useFetchEmployees } from "../hooks/useEmployeeQueries";
import { useAddVisit } from "../hooks/useVisitQueries";

export default function AddVisitModal({ open, onClose, lead }) {
  const [visitedBy, setVisitedBy] = useState("");

  // TENANT-only
  const [ownerName, setOwnerName] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [propertyDetails, setPropertyDetails] = useState("");

  // OWNER-only
  const [tenantName, setTenantName] = useState("");
  const [tenantRequirements, setTenantRequirements] = useState("");

  const [tenantFeedback, setTenantFeedback] = useState("");

  const isTenant = lead?.customerType === "tenant";
  const isOwner = lead?.customerType === "owner";

  const { data } = useFetchEmployees(1, 1000);
  const employees = data?.employees || [];

  const addVisitMutation = useAddVisit(); // ✅ React Query v5

  if (!open || !lead) return null;

  const employeeOptions = employees.map((e) => ({
    value: e._id,
    label: e.name,
  }));

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
        ownerName: isTenant ? ownerName : undefined,
        propertyLocation: isTenant ? propertyLocation : undefined,
        propertyDetails: isTenant ? propertyDetails : undefined,
        tenantName: isOwner ? tenantName : undefined,
        tenantRequirements: isOwner ? tenantRequirements : undefined,
        tenantFeedback,
      },
      {
        onSuccess: () => {
          notify.success("Visit Added Successfully");
          onClose();
        },
        onError: (err) =>
          notify.error(err?.response?.data?.message || "Failed to add visit"),
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          Add Visit for {lead.customerName || lead.ownerName}{" "}
          <span className="text-gray-500 text-sm">
            ({lead.customerType.toUpperCase()})
          </span>
        </h2>

        <SearchableSelect
          label="Visited By"
          value={visitedBy}
          options={employeeOptions}
          onChange={(e) => setVisitedBy(e.target.value)}
        />

        {isTenant && (
          <>
            <input
              className="w-full border px-3 py-2 mt-2"
              placeholder="Owner Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
            <input
              className="w-full border px-3 py-2 mt-2"
              placeholder="Property Location"
              value={propertyLocation}
              onChange={(e) => setPropertyLocation(e.target.value)}
            />
            <textarea
              className="w-full border px-3 py-2 mt-2"
              placeholder="Property Details"
              value={propertyDetails}
              onChange={(e) => setPropertyDetails(e.target.value)}
            />
          </>
        )}

        {isOwner && (
          <>
            <input
              className="w-full border px-3 py-2 mt-2"
              placeholder="Tenant Name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
            />
            <textarea
              className="w-full border px-3 py-2 mt-2"
              placeholder="Tenant Requirements"
              value={tenantRequirements}
              onChange={(e) => setTenantRequirements(e.target.value)}
            />
          </>
        )}

        <textarea
          className="w-full border px-3 py-2 mt-2"
          placeholder="Tenant Feedback (optional)"
          value={tenantFeedback}
          onChange={(e) => setTenantFeedback(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} disabled={addVisitMutation.isPending}>
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
