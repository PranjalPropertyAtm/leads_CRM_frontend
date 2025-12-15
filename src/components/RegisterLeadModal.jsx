

import React, { useState } from "react";
import { motion } from "framer-motion";
import SearchableSelect from "./SearchableSelect";
import { notify } from "../utils/toast";
import { useFetchEmployees } from "../hooks/useEmployeeQueries";
import { useAddRegistration } from "../hooks/useRegistrationQueries";
import axiosInstance from "../lib/axios";

export default function RegistrationModal({ open, onClose, lead }) {
  const [planName, setPlanName] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [registeredBy, setRegisteredBy] = useState("");

  const { data } = useFetchEmployees(1, 1000);
  const employees = data?.employees || [];

  const addRegistrationMutation = useAddRegistration();

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: emp.name,
  }));

  if (!open) return null;

  const handleSubmit = async () => {
    if (!planName.trim()) return notify.error("Plan name is required");
    if (!memberCode.trim()) return notify.error("Member Code is required");
    if (!registeredBy) return notify.error("Please select employee");

    const payload = {
      leadId: lead._id,
      planName,
      memberCode,
      registrationDate: registrationDate || new Date(),
      registeredBy, // employee id
    };

    // try {
    //   const res = await axiosInstance.post("/registrations/add", payload);
    //   notify.success("Registration successful!");
    //   onClose();
    // } catch (err) {
    //   notify.error(err?.response?.data?.message || "Registration failed");
    // }

    addRegistrationMutation.mutate(payload, {
      onSuccess: () => {
        notify.success("Registration Added Successfully");
        onClose();
      },
      onError : (error) => {
        notify.error(error?.response?.data?.message || "Failed to add registartion");
      }
    })
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-4">
          Register Lead — {lead?.customerName || lead?.ownerName}
        </h2>

        {/* Plan Name */}
        <div>
          <label className="text-sm text-gray-600">Plan Name</label>
          <input
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="Example: Premium Plan"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          />
        </div>

        {/* Member Code */}
        <div className="mt-4">
          <label className="text-sm text-gray-600">Member Code</label>
          <input
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="Enter Member Code"
            value={memberCode}
            onChange={(e) => setMemberCode(e.target.value)}
          />
        </div>

        {/* Registered By */}
        <div className="mt-4">
          <SearchableSelect
            label="Registered By"
            value={registeredBy}
            options={employeeOptions}
            onChange={(e) => setRegisteredBy(e.target.value)} // FIXED
          />
        </div>

        {/* Registration Date */}
        <div className="mt-4">
          <label className="text-sm text-gray-600">Registration Date</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 mt-1"
            value={registrationDate}
            onChange={(e) => setRegistrationDate(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 border rounded-lg" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleSubmit}
          >
            Register
          </button>
        </div>
      </motion.div>
    </div>
  );
}
