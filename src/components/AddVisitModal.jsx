import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { notify } from "../utils/toast";
import { useAddVisit } from "../hooks/useVisitQueries";

export default function AddVisitModal({ open, onClose, lead }) {
  const [form, setForm] = useState({
    propertyLocation: "",
    propertyDetails: "",
    tenantFeedback: ""
  });

  const mutation = useAddVisit();

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.propertyLocation.trim())
      return notify.error("Property location required");

    mutation.mutate(
      {
        leadId: lead._id,
        propertyLocation: form.propertyLocation,
        propertyDetails: form.propertyDetails,
        tenantFeedback: form.tenantFeedback,
      },
      {
        onSuccess: () => {
          notify.success("Visit added successfully");
          onClose();
          setForm({ propertyLocation: "", propertyDetails: "", tenantFeedback: "" });
        },
        onError: (err) => {
          notify.error(err.response?.data?.message || "Failed to add visit");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Visit</h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Property Location"
            className="w-full p-2 border rounded-lg"
            value={form.propertyLocation}
            onChange={(e) =>
              setForm({ ...form, propertyLocation: e.target.value })
            }
          />

          <textarea
            placeholder="Property Details"
            className="w-full p-2 border rounded-lg"
            rows={3}
            value={form.propertyDetails}
            onChange={(e) =>
              setForm({ ...form, propertyDetails: e.target.value })
            }
          />

          <textarea
            placeholder="Tenant Feedback"
            className="w-full p-2 border rounded-lg"
            rows={2}
            value={form.tenantFeedback}
            onChange={(e) =>
              setForm({ ...form, tenantFeedback: e.target.value })
            }
          />

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700"
          >
            Add Visit
          </button>
        </div>
      </motion.div>
    </div>
  );
}
