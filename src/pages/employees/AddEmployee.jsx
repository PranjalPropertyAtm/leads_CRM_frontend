import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Mail, Phone, Lock, Briefcase, AlertCircle } from "lucide-react";
import { useAddEmployee } from "../../hooks/useEmployeeQueries.js";
import { notify } from "../../utils/toast.js";

export default function AddEmployee() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    designation: "",
  });

  const { mutate: addEmployee, isPending: loading } = useAddEmployee();
  const [errors, setErrors] = useState({});

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
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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

    addEmployee(formData, {
      onSuccess: () => {
        notify.success("Employee added successfully");
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          designation: "",
        });
        setErrors({});
      },
      onError: (error) => {
        const errorMsg = error.response?.data?.message || "Failed to add employee";
        notify.error(errorMsg);
      },
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Add Employee</h1>
          </div>
          <p className="text-gray-600 ml-0">
            Create a new employee account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              Basic Information
            </h2>

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
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.name ? "border-red-400" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.email ? "border-red-400" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.phone ? "border-red-400" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.designation ? "border-red-400" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.designation && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={16} /> {errors.designation}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label className="flex text-sm font-medium text-gray-700 mb-2 gap-1">
                  <Lock size={16} /> Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.password ? "border-red-400" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={16} /> {errors.password}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding Employee...
                </>
              ) : (
                <>
                  <Users size={20} />
                  Add Employee
                </>
              )}
            </motion.button>

            <motion.button
              type="reset"
              onClick={() => {
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  designation: "",
                });
                setErrors({});
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Clear
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
