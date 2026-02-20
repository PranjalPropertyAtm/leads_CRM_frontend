

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
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
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState(null);
  const fileInputRef = useRef(null);

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
    if (addRegistrationMutation.isPending) return;
    if (!planName.trim()) return notify.error("Plan name is required");
    if (!memberCode.trim()) return notify.error(isCustomizedPlan ? "Customized Code is required" : "Member Code is required");
    if (!isCustomizedPlan && !registeredBy) return notify.error("Please select employee");
    if (!isCustomizedPlan && !paymentScreenshotFile) return notify.error("Please upload payment screenshot");

    const codeValue = memberCode.trim();
    const formData = new FormData();
    formData.append("leadId", lead._id);
    formData.append("planName", planName);
    formData.append(isCustomizedPlan ? "customizedCode" : "memberCode", codeValue);
    const regDate = isCustomizedPlan ? new Date() : (registrationDate ? new Date(registrationDate) : new Date());
    formData.append("registrationDate", regDate.toISOString());
    formData.append("registeredBy", isCustomizedPlan ? (user?._id ?? "") : registeredBy);
    if (paymentScreenshotFile) formData.append("paymentScreenshot", paymentScreenshotFile);

    addRegistrationMutation.mutate(formData, {
      onSuccess: (data) => {
        notify.success("Registration Added Successfully");
        setPaymentScreenshotFile(null);
        const updatedLead = data?.data?.lead;
        onClose();
        if (typeof onSuccess === "function") onSuccess(updatedLead);
      },
      onError: (error) => {
        notify.error(error?.response?.data?.message || "Failed to add registration");
      },
    });
  };

  const clearPaymentFile = () => {
    setPaymentScreenshotFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

        {/* Payment Screenshot — required for non-Customized plans */}
        {!isCustomizedPlan && (
          <div className="mt-4">
            <label className="text-sm text-gray-600">Payment Screenshot *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPaymentScreenshotFile(e.target.files?.[0] || null)}
            />
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <ImagePlus size={18} />
                {paymentScreenshotFile ? paymentScreenshotFile.name : "Choose image"}
              </button>
              {paymentScreenshotFile && (
                <button
                  type="button"
                  onClick={clearPaymentFile}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  title="Remove"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF or WebP (max 5MB)</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 border rounded-lg" onClick={onClose}>
            Cancel
          </button>

          <button
            disabled={addRegistrationMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSubmit}
          >
            {addRegistrationMutation.isPending ? "Registering..." : "Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
