import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Lock, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useFetchEmployees, useUpdateEmployee } from "../../hooks/useEmployeeQueries.js";
import { notify } from "../../utils/toast.js";

const PERMISSION_GROUPS = {
  Leads: [
    "leads:view",
    "leads:add",
    "leads:edit",
    "leads:delete",
    "leads:assign",
  ],
  Visits: ["visits:add", "visits:view", "visits:edit"],
  Registrations: ["registrations:add", "registrations:view"],
  Employees: ["employees:view", "employees:add", "employees:edit", "employees:delete"],
  Masters: ["masters:manage"],
  Reports: ["reports:view"],
  Profile: ["profile:edit"],
};

// Same as backend CUSTOMER_CARE_DEFAULT_PERMISSIONS and as permissions for designation "customer care"
const CUSTOMER_CARE_PERMISSIONS = [
  "leads:view",
  "leads:add",
  "leads:edit",
  "leads:assign",
  "visits:add",
  "visits:view",
  "visits:edit",
  "registrations:add",
  "registrations:view",
  "employees:view",
  "reports:view",
  "profile:edit",
];

const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flat();

export default function AddPermissions() {
  const { data: paginated = { employees: [] }, isLoading: storeLoading } = useFetchEmployees();
  const employees = paginated.employees || [];
  const { mutate: updateEmployee, isPending: updatingPermissions } = useUpdateEmployee();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState("employee");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all employees is now handled by useFetchEmployees hook

  // Handle employee selection
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    const empRole = employee.role === "admin" ? "admin" : employee.role === "customer_care_executive" ? "customer_care_executive" : "employee";
    setRole(empRole);
    // For customer care, only allow the fixed set; for admin/employee use saved permissions
    if (empRole === "customer_care_executive") {
      const current = employee.permissions || [];
      setPermissions(current.filter((p) => CUSTOMER_CARE_PERMISSIONS.includes(p)).length > 0
        ? current.filter((p) => CUSTOMER_CARE_PERMISSIONS.includes(p))
        : [...CUSTOMER_CARE_PERMISSIONS]);
    } else if (empRole === "admin") {
      setPermissions(employee.permissions?.length ? employee.permissions : [...ALL_PERMISSIONS]);
    } else {
      setPermissions(employee.permissions || []);
    }
    setSearchQuery("");
  };

  // When role dropdown changes: restrict permissions to the role's allowed set
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === "customer_care_executive") {
      setPermissions((prev) => {
        const within = prev.filter((p) => CUSTOMER_CARE_PERMISSIONS.includes(p));
        return within.length > 0 ? within : [...CUSTOMER_CARE_PERMISSIONS];
      });
    } else if (newRole === "admin") {
      setPermissions([...ALL_PERMISSIONS]);
    }
    // employee: keep current permissions as-is
  };

  // Toggle permission
  const handlePermissionToggle = (permission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  // Permissions allowed for current role (for Customer Care we only show and send these)
  const allowedPermissionsForRole = role === "customer_care_executive" ? CUSTOMER_CARE_PERMISSIONS : null;

  // Save permissions
  const handleSavePermissions = async () => {
    if (!selectedEmployee) {
      notify.error("Please select an employee");
      return;
    }
    const toSave = allowedPermissionsForRole ? permissions.filter((p) => allowedPermissionsForRole.includes(p)) : permissions;

    updateEmployee(
      { employeeId: selectedEmployee._id, updateData: { permissions: toSave, role } },
      {
        onSuccess: () => {
          notify.success("Permissions and role updated successfully");
          setSelectedEmployee({
            ...selectedEmployee,
            permissions: toSave,
            role,
          });
        },
        onError: (error) => {
          const errorMsg = error.response?.data?.message || "Failed to update permissions";
          notify.error(errorMsg);
        },
      }
    );
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Lock className="text-purple-600" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Manage Permissions
            </h1>
          </div>
          <p className="text-gray-600 ml-0">
            Select an employee and assign or update their permissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employees List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-1 h-fit"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Employees
            </h2>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Employee List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {storeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="animate-spin text-blue-500" size={24} />
                </div>
              ) : filteredEmployees.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchQuery ? "No employees found" : "No employees available"}
                </p>
              ) : (
                filteredEmployees.map((employee) => (
                  <motion.button
                    key={employee._id}
                    onClick={() => handleSelectEmployee(employee)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition ${
                      selectedEmployee?._id === employee._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium text-gray-800">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {employee.designation}
                    </p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                      employee.role === "admin" ? "bg-indigo-100 text-indigo-800" :
                      employee.role === "customer_care_executive" ? "bg-amber-100 text-amber-800" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {employee.role === "admin" ? "Admin" : employee.role === "customer_care_executive" ? "Customer Care" : "Employee"}
                    </span>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>

          {/* Permissions Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-2"
          >
            {selectedEmployee ? (
              <>
                {/* Selected Employee Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {selectedEmployee.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {selectedEmployee.email}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Designation: {selectedEmployee.designation}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Role:</span>
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="admin">Admin (Super Admin) — All permissions</option>
                      <option value="customer_care_executive">Customer Care Executive</option>
                      <option value="employee">Normal Employee</option>
                    </select>
                    <span className="text-xs text-gray-500">
                      Admin has full access; Customer Care can view all leads; Employee has limited access.
                    </span>
                  </div>
                </div>

                {/* Permissions */}
                <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Lock size={20} className="text-purple-600" />
                  Assign Permissions
                </h2>

                <div className="space-y-6">
                  {role === "customer_care_executive" && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                      Customer Care Executive can only have the permissions listed below. Other permissions are not available for this role.
                    </p>
                  )}
                  {Object.entries(PERMISSION_GROUPS).map((group) => {
                    const permsInGroup = allowedPermissionsForRole
                      ? group[1].filter((p) => allowedPermissionsForRole.includes(p))
                      : group[1];
                    if (permsInGroup.length === 0) return null;
                    return (
                      <div key={group[0]}>
                        <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          {group[0]}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                          {permsInGroup.map((permission) => (
                            <label
                              key={permission}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                            >
                              <input
                                type="checkbox"
                                checked={permissions.includes(permission)}
                                onChange={() =>
                                  handlePermissionToggle(permission)
                                }
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                              />
                              <span className="text-sm text-gray-700">
                                {permission}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Permissions Summary */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    Selected Permissions ({permissions.length}):
                  </p>
                  {permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No permissions selected
                    </p>
                  )}
                </div>

                {/* Save Button */}
                <motion.button
                  onClick={handleSavePermissions}
                  disabled={updatingPermissions}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updatingPermissions ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Save Permissions
                    </>
                  )}
                </motion.button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle size={48} className="text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">
                  Select an employee from the list to assign permissions
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
