

import React, { useState } from "react";
import { motion } from "framer-motion";
import SearchableSelect from "./SearchableSelect";
import { notify } from "../utils/toast";
import { useFetchEmployees } from "../hooks/useEmployeeQueries";
import { useAddRegistration } from "../hooks/useRegistrationQueries";
import { useLoadUser } from "../hooks/useAuthQueries";

export default function RegistrationModal({ open, onClose, lead }) {
  const [planName, setPlanName] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [registeredBy, setRegisteredBy] = useState("");

  const { data: user } = useLoadUser();
  const { data } = useFetchEmployees(1, 1000);
  const employees = data?.employees || [];

  const addRegistrationMutation = useAddRegistration();

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: emp.name,
  }));

  if (!open) return null;

  const isCustomizedPlan = planName === "Customized";

  const handleSubmit = async () => {
    if (!planName.trim()) return notify.error("Plan name is required");
    if (!memberCode.trim()) return notify.error(isCustomizedPlan ? "Customized Code is required" : "Member Code is required");
    if (!isCustomizedPlan && !registeredBy) return notify.error("Please select employee");

    const codeValue = memberCode.trim();
    const payload = {
      leadId: lead._id,
      planName,
      ...(isCustomizedPlan ? { customizedCode: codeValue } : { memberCode: codeValue }),
      registrationDate: isCustomizedPlan ? new Date() : (registrationDate || new Date()),
      registeredBy: isCustomizedPlan ? (user?._id ?? "") : registeredBy,
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
          <label className="text-sm text-gray-600">Plan Name *</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={planName}
            onChange={(e) => {
              const newPlan = e.target.value;
              if (planName === "Customized" && newPlan !== "Customized") {
                setMemberCode("");
              }
              setPlanName(newPlan);
            }}
          >
            <option value="">Select plan</option>
            <option value="Orange">Orange</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
            <option value="Customized">Customized</option>
          </select>
        </div>

        {/* Member Code / Customized Code */}
        <div className="mt-4">
          <label className="text-sm text-gray-600">
            {isCustomizedPlan ? "Customized Code *" : "Member Code *"}
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder={isCustomizedPlan ? "Enter Customized Code (uppercase only)" : "Enter Member Code (uppercase only)"}
            value={memberCode}
            onChange={(e) => setMemberCode(e.target.value.toUpperCase())}
          />
        </div>

        {/* Registered By — hidden for Customized plan */}
        {!isCustomizedPlan && (
          <div className="mt-4">
            <SearchableSelect
              label="Registered By"
              value={registeredBy}
              options={employeeOptions}
              onChange={(e) => setRegisteredBy(e.target.value)}
            />
          </div>
        )}

        {/* Registration Date — hidden for Customized plan */}
        {!isCustomizedPlan && (
          <div className="mt-4">
            <label className="text-sm text-gray-600">Registration Date</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={registrationDate}
              onChange={(e) => setRegistrationDate(e.target.value)}
              onClick={(e) => e.target.showPicker()}
            />
          </div>
        )}

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
