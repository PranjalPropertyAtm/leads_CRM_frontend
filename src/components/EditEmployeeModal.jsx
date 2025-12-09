import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, AlertCircle, Mail, Phone, Briefcase } from "lucide-react";
import { useUpdateEmployee } from "../hooks/useEmployeeQueries";
import { notify } from "../utils/toast";

export default function EditEmployeeModal({ open, onClose, employee }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  // Update form when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        designation: employee.designation || "",
        status: employee.status || "active",
      });
      setErrors({});
    }
  }, [employee]);

  const updateEmployee = useUpdateEmployee();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }
    if (!formData.designation.trim()) newErrors.designation = "Designation is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notify.error("Please fix the errors");
      return;
    }

    updateEmployee.mutate(
      {
        employeeId: employee._id,
        updateData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          designation: formData.designation,
          status: formData.status,
        },
      },
      {
        onSuccess: () => {
          notify.success("Employee updated successfully");
          onClose();
        },
        onError: (error) => {
          const errorMsg = error.response?.data?.message || "Failed to update employee";
          notify.error(errorMsg);
        },
      }
    );
  };

  if (!open || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Edit Employee</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter employee name"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.name ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={16} /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 gap-1">
                <Mail size={16} /> Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="employee@example.com"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={16} /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 gap-1">
                <Phone size={16} /> Phone (10 digits)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="1234567890"
                maxLength="10"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={16} /> {errors.phone}
                </p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-2 gap-1">
                <Briefcase size={16} /> Designation *
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="e.g., Sales Manager, Team Lead"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.designation ? "border-red-400" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.designation && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={16} /> {errors.designation}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="flex text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateEmployee.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {updateEmployee.isPending ? "Updating..." : "Update Employee"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

