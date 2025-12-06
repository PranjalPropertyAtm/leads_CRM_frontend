// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { X } from "lucide-react";
// import { notify } from "../utils/toast";
// import { useAddVisit } from "../hooks/useVisitQueries";

// export default function AddVisitModal({ open, onClose, lead }) {
//   const [form, setForm] = useState({
//     propertyLocation: "",
//     propertyDetails: "",
//     tenantFeedback: ""
//   });

//   const mutation = useAddVisit();

//   if (!open) return null;

//   const handleSubmit = () => {
//     if (!form.propertyLocation.trim())
//       return notify.error("Property location required");

//     mutation.mutate(
//       {
//         leadId: lead._id,
//         propertyLocation: form.propertyLocation,
//         propertyDetails: form.propertyDetails,
//         tenantFeedback: form.tenantFeedback,
//       },
//       {
//         onSuccess: () => {
//           notify.success("Visit added successfully");
//           onClose();
//           setForm({ propertyLocation: "", propertyDetails: "", tenantFeedback: "" });
//         },
//         onError: (err) => {
//           notify.error(err.response?.data?.message || "Failed to add visit");
//         },
//       }
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <motion.div
//         initial={{ scale: 0.85, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl"
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Add Visit</h2>
//           <button onClick={onClose}>
//             <X size={22} />
//           </button>
//         </div>

//         <div className="space-y-4">
//           <input
//             placeholder="Property Location"
//             className="w-full p-2 border rounded-lg"
//             value={form.propertyLocation}
//             onChange={(e) =>
//               setForm({ ...form, propertyLocation: e.target.value })
//             }
//           />

//           <textarea
//             placeholder="Property Details"
//             className="w-full p-2 border rounded-lg"
//             rows={3}
//             value={form.propertyDetails}
//             onChange={(e) =>
//               setForm({ ...form, propertyDetails: e.target.value })
//             }
//           />

//           <textarea
//             placeholder="Tenant Feedback"
//             className="w-full p-2 border rounded-lg"
//             rows={2}
//             value={form.tenantFeedback}
//             onChange={(e) =>
//               setForm({ ...form, tenantFeedback: e.target.value })
//             }
//           />

//           <button
//             onClick={handleSubmit}
//             className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700"
//           >
//             Add Visit
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

import React, { useState } from "react";
import axiosInstance from "../lib/axios";
import { notify } from "../utils/toast";
import SearchableSelect from "./SearchableSelect";
import { useFetchEmployees } from "../hooks/useEmployeeQueries";
import { useAddVisit } from "../hooks/useVisitQueries";

export default function AddVisitModal({ open, onClose, lead }) {
  const [propertyLocation, setPropertyLocation] = useState("");
  const [propertyDetails, setPropertyDetails] = useState("");
  const [tenantFeedback, setTenantFeedback] = useState("");
  const [visitedBy, setVisitedBy] = useState("");

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
    if (!propertyLocation.trim()) return notify.error("Property location is required");
    if (!propertyDetails.trim()) return notify.error("Property details are required");

    const payload = {
      leadId: lead._id,
      propertyLocation,
      propertyDetails,
      tenantFeedback,
      visitedBy, // employee id
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



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">
          Add Visit for {lead?.customerName || lead?.ownerName}
        </h2>

        {/* Employee Select */}
        <SearchableSelect
          label="Visited By"
          value={visitedBy}
          options={employeeOptions}
          onChange={(e) => setVisitedBy(e.target.value)}
        />

        {/* Property Location */}
        <div className="mt-2">
          <label className="text-sm">Property Location</label>
          <input
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="Example: Andheri East"
            value={propertyLocation}
            onChange={(e) => setPropertyLocation(e.target.value)}
          />
        </div>

        {/* Property Details */}
        <div className="mt-3">
          <label className="text-sm">Property Details</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="Example: 2BHK, Fully Furnished..."
            rows={3}
            value={propertyDetails}
            onChange={(e) => setPropertyDetails(e.target.value)}
          />
        </div>

        {/* Tenant Feedback */}
        <div className="mt-3">
          <label className="text-sm">Tenant Feedback (Optional)</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="Example: Liked the property..."
            rows={2}
            value={tenantFeedback}
            onChange={(e) => setTenantFeedback(e.target.value)}
          />
        </div>

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
