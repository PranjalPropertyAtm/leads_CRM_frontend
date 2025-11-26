// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { Eye, Trash2, Search, X } from "lucide-react";
// import { useMyLeads, useDeleteLead } from "../../hooks/useLeadQueries.js";
// import { notify } from "../../utils/toast.js";
// import axiosInstance from "../../lib/axios.js";

// export default function MyLeads() {
//   const [filter, setFilter] = useState("");
//   const [selected, setSelected] = useState(null);

//   // Registration Modal states
//   const [showRegModal, setShowRegModal] = useState(false);
//   const [regPlan, setRegPlan] = useState("");
//   const [regDate, setRegDate] = useState("");



//   const { data = { leads: [], total: 0 }, isLoading } = useMyLeads();
//   const { leads = [], total = 0 } = data;

//   const deleteLeadMutation = useDeleteLead?.();

//   const handleDelete = (id) => {
//     if (!window.confirm("Are you sure you want to delete this lead?")) return;

//     if (!deleteLeadMutation) {
//       notify.error("Delete operation not available");
//       return;
//     }

//     deleteLeadMutation.mutate(id, {
//       onSuccess: () => {
//         notify.success("Lead deleted successfully");
//         if (selected?._id === id) setSelected(null);
//       },
//       onError: (err) => {
//         const msg = err?.response?.data?.message || "Failed to delete lead";
//         notify.error(msg);
//       },
//     });
//   };

//   const handleRegisterLead = async () => {
//     if (!regPlan.trim()) return notify.error("Plan name is required");

//     try {
//       const { data } = await axiosInstance.post("/registrations/add", {
//         leadId: selected._id,
//         planName: regPlan,
//         registrationDate: regDate || new Date(),
//       });

//       notify.success(data.message);

//       // Update selected lead locally (no need zustand or react-query)
//       setSelected({
//         ...selected,
//         isRegistered: true,
//         registrationDetails: {
//           planName: regPlan,
//           registrationDate: regDate,
//           registeredBy: "You", // Optional: replace with actual user
//         },
//       });

//       setShowRegModal(false);
//       setRegPlan("");
//       setRegDate("");
//     } catch (error) {
//       notify.error(
//         error.response?.data?.message || "Failed to register customer"
//       );
//     }
//   };




//   const filtered = (leads || []).filter((lead) => {
//     const q = filter.trim().toLowerCase();
//     if (!q) return true;
//     return (
//       (lead.customerName || "").toLowerCase().includes(q) ||
//       (lead.ownerName || "").toLowerCase().includes(q) ||
//       (lead.email || "").toLowerCase().includes(q) ||
//       (lead.mobileNumber || "").toLowerCase().includes(q) ||
//       (lead.city || "").toLowerCase().includes(q) ||
//       (lead.propertyType || "").toLowerCase().includes(q) ||
//       (lead.source || "").toLowerCase().includes(q)
//     );
//   });

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 font-[Inter]">
//       <motion.div
//         initial={{ opacity: 0, y: 8 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-7xl mx-auto"
//       >
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-semibold text-gray-900">My Leads</h1>
//             <p className="text-sm text-gray-500">Leads assigned to you</p>
//           </div>

//           <div className="relative">
//             <Search className="absolute left-3 top-3 text-gray-400" size={16} />
//             <input
//               placeholder="Search my leads..."
//               className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//           <div>
//             {isLoading ? (
//               <div className="py-10 text-center text-gray-500">Loading...</div>
//             ) : filtered.length === 0 ? (
//               <div className="py-10 text-center text-gray-500">No leads found</div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full border-separate border-spacing-0 text-sm">
//                   <thead>
//                     <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide border-b">
//                       {["S.NO", "Name", "Type", "Mobile", "City", "Property Type", "Source", "Registered", "Actions"].map((h) => (
//                         <th key={h} className="px-5 py-4 font-semibold text-left border-b border-gray-200">{h}</th>
//                       ))}
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {filtered.map((lead, idx) => (
//                       <tr key={lead._id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/40 transition-colors`}>
//                         <td className="px-4 py-3 font-medium text-gray-900">{idx + 1}</td>
//                         <td className="px-4 py-3 font-medium text-gray-900">
//                           <div className="flex flex-col">
//                             <span>{lead.customerName || lead.ownerName || "N/A"}</span>
//                             <span className="text-xs text-gray-400">{lead._id}</span>
//                           </div>
//                         </td>

//                         <td className="px-5 py-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${lead.customerType === "tenant" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
//                             {lead.customerType === "tenant" ? "Tenant" : "Owner"}
//                           </span>
//                         </td>

//                         <td className="px-5 py-4 text-gray-700">{lead.mobileNumber}</td>
//                         <td className="px-5 py-4 text-gray-700">{lead.city}</td>
//                         <td className="px-5 py-4 text-gray-700">{lead.propertyType}</td>
//                         <td className="px-5 py-4 text-gray-700">{lead.source}</td>

//                         <td className="px-4 py-3">
//                           {lead.isRegistered ? (
//                             <span className="text-green-600 font-medium">
//                               Yes
//                             </span>
//                           ) : (
//                             <span className="text-red-500 font-medium">No</span>
//                           )}
//                         </td>

//                         <td className="px-5 py-4 flex items-center gap-3">
//                           <button onClick={() => setSelected(lead)} className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs flex items-center gap-1 hover:bg-blue-200 transition" title="View details">
//                             <Eye size={14} />
//                           </button>

//                           <button onClick={() => handleDelete(lead._id)} className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 text-xs flex items-center gap-1 hover:bg-red-200 transition" title="Delete lead">
//                             <Trash2 size={14} />
//                           </button>

//                           {!lead.isRegistered && (
//                             <button
//                               onClick={() => {
//                                 // setSelected(lead);
//                                 setShowRegModal(true);
//                               }}
//                               className="px-3 py-1.5 rounded-md bg-green-100 text-green-700 text-xs hover:bg-green-200"
//                             >
//                               Register
//                             </button>
//                           )}

//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>

//         {selected && (
//           <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
//             <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />

//             <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 z-10">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900">{selected.customerName || selected.ownerName}</h3>
//                   <p className="text-sm text-gray-500">{selected.customerType === "tenant" ? "Tenant Lead" : "Owner Lead"}</p>
//                 </div>

//                 <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelected(null)}>
//                   <X size={22} />
//                 </button>
//               </div>

//               <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
//                 <div>
//                   <p className="text-gray-500">Mobile Number</p>
//                   <p className="font-medium">{selected.mobileNumber}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-500">Email</p>
//                   <p className="font-medium">{selected.email || "N/A"}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-500">City</p>
//                   <p className="font-medium">{selected.city}</p>
//                 </div>

//                 {selected.customerType === "tenant" && (
//                   <>
//                     <div>
//                       <p className="text-gray-500">Preferred Location</p>
//                       <p className="font-medium">{selected.preferredLocation || "N/A"}</p>
//                     </div>

//                     <div>
//                       <p className="text-gray-500">Budget</p>
//                       <p className="font-medium">{selected.budget ? `₹${selected.budget}` : "N/A"}</p>
//                     </div>
//                   </>
//                 )}

//                 <div>
//                   <p className="text-gray-500">Property Type</p>
//                   <p className="font-medium">{selected.propertyType}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-500">Sub-Property Type</p>
//                   <p className="font-medium">{selected.subPropertyType}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-500">Source</p>
//                   <p className="font-medium">{selected.source}</p>
//                 </div>

//                 {selected.customerType === "owner" && (
//                   <>
//                     <div>
//                       <p className="text-gray-500">Property Location</p>
//                       <p className="font-medium">{selected.propertyLocation || "N/A"}</p>
//                     </div>

//                     <div>
//                       <p className="text-gray-500">Area</p>
//                       <p className="font-medium">{selected.area || "N/A"}</p>
//                     </div>

//                     <div>
//                       <p className="text-gray-500">Landmark</p>
//                       <p className="font-medium">{selected.landmark || "N/A"}</p>
//                     </div>

//                     <div>
//                       <p className="text-gray-500">Requirements</p>
//                       <p className="font-medium">{selected.requirements || "N/A"}</p>
//                     </div>
//                   </>
//                 )}

//                 {selected.requirements && (
//                   <div className="md:col-span-2">
//                     <p className="text-gray-500">Requirements</p>
//                     <p className="font-medium">{selected.requirements}</p>
//                   </div>
//                 )}

//                 <div className="md:col-span-2">
//                   <p className="text-gray-500">Lead ID</p>
//                   <p className="text-xs text-gray-400 word-break">{selected._id}</p>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//         {showRegModal &&  (
//                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//                  <motion.div
//                    initial={{ scale: 0.95, opacity: 0 }}
//                    animate={{ scale: 1, opacity: 1 }}
//                    className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
//                  >
//                    <h2 className="text-xl font-semibold text-gray-800">
//                      Register Lead
//                    </h2>
     
//                    <div className="mt-4 space-y-4">
//                      <div>
//                        <label className="text-sm text-gray-600">Plan Name</label>
//                        <input
//                          className="w-full border rounded-lg px-3 py-2 mt-1"
//                          placeholder="Example: Premium Plan"
//                          value={regPlan}
//                          onChange={(e) => setRegPlan(e.target.value)}
//                        />
//                      </div>
     
//                      <div>
//                        <label className="text-sm text-gray-600">
//                          Registration Date
//                        </label>
//                        <input
//                          type="date"
//                          className="w-full border rounded-lg px-3 py-2 mt-1"
//                          value={regDate}
//                          onChange={(e) => setRegDate(e.target.value)}
//                        />
//                      </div>
     
//                      <div className="flex justify-end gap-3 pt-4">
//                        <button
//                          onClick={() => setShowRegModal(false)}
//                          className="px-4 py-2 border rounded-lg"
//                        >
//                          Cancel
//                        </button>
//                        <button
//                          onClick={handleRegisterLead}
//                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                        >
//                          Confirm Registration
//                        </button>
//                      </div>
//                    </div>
//                  </motion.div>
//                </div>
//              )}
//       </motion.div>
         

//     </div>

//   );
// }
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, Search, X } from "lucide-react";
import { useMyLeads, useDeleteLead } from "../../hooks/useLeadQueries.js";
import { notify } from "../../utils/toast.js";
import axiosInstance from "../../lib/axios.js";

export default function MyLeads() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);

  // Registration Modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [regPlan, setRegPlan] = useState("");
  const [regDate, setRegDate] = useState("");

  const { data = { leads: [], total: 0 }, isLoading } = useMyLeads();
  const { leads = [], total = 0 } = data;

  const deleteLeadMutation = useDeleteLead?.();

  // -----------------------------
  // DELETE LEAD
  // -----------------------------
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    deleteLeadMutation.mutate(id, {
      onSuccess: () => {
        notify.success("Lead deleted successfully");
        if (selected?._id === id) setSelected(null);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to delete lead";
        notify.error(msg);
      },
    });
  };

  // -----------------------------
  // REGISTER LEAD (FIXED)
  // -----------------------------
  const handleRegisterLead = async () => {
    if (!regPlan.trim()) return notify.error("Plan name is required");
    if (!selected?._id) return notify.error("Lead not selected!");

    try {
      const { data } = await axiosInstance.post("/registrations/add", {
        leadId: selected._id,
        planName: regPlan,
        registrationDate: regDate || new Date(),
      });

      notify.success(data.message);

      // Update selected state
      setSelected({
        ...selected,
        isRegistered: true,
        registrationDetails: {
          planName: regPlan,
          registrationDate: regDate,
        },
      });

      setShowRegModal(false);
      setRegPlan("");
      setRegDate("");
    } catch (error) {
      notify.error(
        error.response?.data?.message || "Failed to register customer"
      );
    }
  };

  // -----------------------------
  // FILTER
  // -----------------------------
  const filtered = (leads || []).filter((lead) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      (lead.customerName || "").toLowerCase().includes(q) ||
      (lead.ownerName || "").toLowerCase().includes(q) ||
      (lead.email || "").toLowerCase().includes(q) ||
      (lead.mobileNumber || "").toLowerCase().includes(q) ||
      (lead.city || "").toLowerCase().includes(q) ||
      (lead.propertyType || "").toLowerCase().includes(q) ||
      (lead.source || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-[Inter]">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">My Leads</h1>
            <p className="text-sm text-gray-500">Leads assigned to you</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              placeholder="Search my leads..."
              className="pl-10 pr-4 py-2 rounded-lg border w-80 shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No leads found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                    {[
                      "S.NO", "Name", "Type", "Mobile", "City", "Property", "Source", "Registered", "Actions",
                    ].map((h) => (
                      <th key={h} className="px-5 py-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((lead, idx) => (
                    <tr key={lead._id} className="hover:bg-blue-50/40 transition">
                      <td className="px-4 py-3">{idx + 1}</td>

                      <td className="px-4 py-3 font-medium">
                        <div className="flex flex-col">
                          <span>{lead.customerName || lead.ownerName || "N/A"}</span>
                          <span className="text-xs text-gray-400">{lead._id}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          lead.customerType === "tenant"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}>
                          {lead.customerType}
                        </span>
                      </td>

                      <td className="px-4 py-3">{lead.mobileNumber}</td>
                      <td className="px-4 py-3">{lead.city}</td>
                      <td className="px-4 py-3">{lead.propertyType}</td>
                      <td className="px-4 py-3">{lead.source}</td>

                      <td className="px-4 py-3">
                        {lead.isRegistered ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-red-500 font-medium">No</span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3 flex items-center gap-3">

                        {/* VIEW DETAILS */}
                        <button
                          onClick={() => setSelected(lead)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md"
                        >
                          <Eye size={14} />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md"
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* REGISTER BUTTON — FIXED */}
                        {!lead.isRegistered && (
                          <button
                            onClick={() => {
                              setSelected(lead);       // <-- FIXED
                              setShowRegModal(true);   // <-- FIXED
                            }}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md"
                          >
                            Register
                          </button>
                        )}

                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>

        
         {selected && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />

            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selected.customerName || selected.ownerName}</h3>
                  <p className="text-sm text-gray-500">{selected.customerType === "tenant" ? "Tenant Lead" : "Owner Lead"}</p>
                </div>

                <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelected(null)}>
                  <X size={22} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <p className="text-gray-500">Mobile Number</p>
                  <p className="font-medium">{selected.mobileNumber}</p>
                </div>

                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selected.email || "N/A"}</p>
                </div>

                <div>
                  <p className="text-gray-500">City</p>
                  <p className="font-medium">{selected.city}</p>
                </div>

                {selected.customerType === "tenant" && (
                  <>
                    <div>
                      <p className="text-gray-500">Preferred Location</p>
                      <p className="font-medium">{selected.preferredLocation || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="font-medium">{selected.budget ? `₹${selected.budget}` : "N/A"}</p>
                    </div>
                  </>
                )}

                <div>
                  <p className="text-gray-500">Property Type</p>
                  <p className="font-medium">{selected.propertyType}</p>
                </div>

                <div>
                  <p className="text-gray-500">Sub-Property Type</p>
                  <p className="font-medium">{selected.subPropertyType}</p>
                </div>

                <div>
                  <p className="text-gray-500">Source</p>
                  <p className="font-medium">{selected.source}</p>
                </div>

                {selected.customerType === "owner" && (
                  <>
                    <div>
                      <p className="text-gray-500">Property Location</p>
                      <p className="font-medium">{selected.propertyLocation || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Area</p>
                      <p className="font-medium">{selected.area || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Landmark</p>
                      <p className="font-medium">{selected.landmark || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Requirements</p>
                      <p className="font-medium">{selected.requirements || "N/A"}</p>
                    </div>
                  </>
                )}

                {selected.requirements && (
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Requirements</p>
                    <p className="font-medium">{selected.requirements}</p>
                  </div>
                )}

                <div className="md:col-span-2">
                  <p className="text-gray-500">Lead ID</p>
                  <p className="text-xs text-gray-400 word-break">{selected._id}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ---------------------------------------- */}
        {/* REGISTRATION MODAL — FIXED */}
        {/* ---------------------------------------- */}
        {showRegModal &&  (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl max-w-md w-full">

              <h2 className="text-xl font-semibold">Register Lead</h2>
              <p className="text-sm text-gray-600">
                Lead: <b>{selected.customerName || selected.ownerName}</b>
              </p>

              <div className="mt-4 space-y-4">

                <div>
                  <label className="text-sm text-gray-600">Plan Name</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    placeholder="Premium Plan"
                    value={regPlan}
                    onChange={(e) => setRegPlan(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Registration Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setShowRegModal(false)} className="px-4 py-2 border rounded-lg">
                    Cancel
                  </button>

                  <button onClick={handleRegisterLead} className="px-4 py-2 bg-green-600 text-white rounded-lg">
                    Confirm Registration
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
