// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import SearchableSelect from "./SearchableSelect";
// import axiosInstance from "../lib/axios";
// import { notify } from "../utils/toast";

// export default function RegisterLeadModal({
//   open,
//   onClose,
//   employeeOptions = [],
//   lead,
//   onSuccess,
// }) {
//   const [planName, setPlanName] = useState("");
//   const [memberCode, setMemberCode] = useState("");
//   const [regBy, setRegBy] = useState(""); // employee ID
//   const [regDate, setRegDate] = useState("");
//   const [loading, setLoading] = useState(false);

//   if (!open) return null;

//   const handleSubmit = async () => {
//     if (!planName.trim()) return notify.error("Plan name is required");
//     if (!memberCode.trim()) return notify.error("Member code is required");
//     if (!regBy) return notify.error("Please select the employee");
//     if (!lead?._id) return notify.error("Invalid Lead!");

//     try {
//       setLoading(true);

//       const payload = {
//         leadId: lead._id,
//         planName,
//         registrationDate: regDate || new Date(),
//         memberCode,
//         registeredBy: regBy, // EMPLOYEE ID SAVED CORRECTLY
//       };

//       const res = await axiosInstance.post("/registrations/add", payload);

//       notify.success("Lead Registered Successfully");

//       onClose();
//       if (onSuccess) onSuccess(res.data);

//     } catch (error) {
//       notify.error(error.response?.data?.message || "Registration Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
//       >
//         <h2 className="text-xl font-semibold text-gray-800">Register Lead</h2>

//         <div className="mt-4 space-y-4">
//           {/* Plan Name */}
//           <div>
//             <label className="text-sm text-gray-600">Plan Name</label>
//             <input
//               className="w-full border rounded-lg px-3 py-2 mt-1"
//               placeholder="Example: Premium Plan"
//               value={planName}
//               onChange={(e) => setPlanName(e.target.value)}
//             />
//           </div>

//           {/* Member Code */}
//           <div>
//             <label className="text-sm text-gray-600">Member Code</label>
//             <input
//               className="w-full border rounded-lg px-3 py-2 mt-1"
//               placeholder="Enter Member Code"
//               value={memberCode}
//               onChange={(e) => setMemberCode(e.target.value)}
//             />
//           </div>

//           {/* Registered By */}
//           <SearchableSelect
//             label="Registered By"
//             name="registeredBy"
//             value={regBy}
//             options={employeeOptions}
//             onChange={(value) => setRegBy(value)} // 100% FIXED
//           />

//           {/* Registration Date */}
//           <div>
//             <label className="text-sm text-gray-600">Registration Date</label>
//             <input
//               type="date"
//               className="w-full border rounded-lg px-3 py-2 mt-1"
//               value={regDate}
//               onChange={(e) => setRegDate(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex justify-end gap-3 mt-6">
//           <button
//             className="px-4 py-2 border rounded-lg"
//             onClick={onClose}
//           >
//             Cancel
//           </button>

//           <button
//             className={`px-4 py-2 rounded-lg text-white ${
//               loading
//                 ? "bg-green-400 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             }`}
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? "Registering..." : "Confirm Registration"}
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { motion } from "framer-motion";
import SearchableSelect from "./SearchableSelect";
import { notify } from "../utils/toast";
import { useFetchEmployees } from "../hooks/useEmployeeQueries";
import axiosInstance from "../lib/axios";

export default function RegistrationModal({ open, onClose, lead }) {
  const [planName, setPlanName] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [registeredBy, setRegisteredBy] = useState("");

  const { data } = useFetchEmployees(1, 1000);
  const employees = data?.employees || [];

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

    try {
      const res = await axiosInstance.post("/registrations/add", payload);
      notify.success("Registration successful!");
      onClose();
    } catch (err) {
      notify.error(err?.response?.data?.message || "Registration failed");
    }
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
            onChange={(value) => setRegisteredBy(value)} // FIXED
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
