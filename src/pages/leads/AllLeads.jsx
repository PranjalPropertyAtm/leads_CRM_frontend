// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { Eye, Trash2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
// import { useFetchLeads, useDeleteLead } from "../../hooks/useLeadQueries.js";
// import { notify } from "../../utils/toast.js";

// export default function AllLeads() {
//   const [filter, setFilter] = useState("");
//   const [selected, setSelected] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   const { data: paginatedData = { leads: [], total: 0, totalPages: 0, page: 1 }, isLoading } = useFetchLeads(currentPage, pageSize);
//   const { leads = [], total = 0, totalPages = 0 } = paginatedData;

//   // Create delete hook (if available)
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

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   const handlePageSizeChange = (e) => {
//     const newSize = parseInt(e.target.value, 10);
//     setPageSize(newSize);
//     setCurrentPage(1);
//   };

//   const filtered = leads.filter((lead) => {
//     const q = filter.trim().toLowerCase();
//     if (!q) return true;

//     return (
//       lead.customerName?.toLowerCase().includes(q) ||
//       lead.ownerName?.toLowerCase().includes(q) ||
//       lead.email?.toLowerCase().includes(q) ||
//       lead.mobileNumber?.toLowerCase().includes(q) ||
//       lead.city?.toLowerCase().includes(q) ||
//       lead.propertyType?.toLowerCase().includes(q) ||
//       lead.source?.toLowerCase().includes(q) ||
//       lead.budget?.toString().toLowerCase().includes(q) ||
//       lead.createdBy?.name?.toLowerCase().includes(q) 
//     );
//   });

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 font-[Inter]">
//       <motion.div
//         initial={{ opacity: 0, y: 8 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-7xl mx-auto"
//       >
//         {/* HEADER */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-semibold text-gray-900">Leads</h1>
//             <p className="text-sm text-gray-500">View and manage all leads</p>
//           </div>

//           <div className="relative">
//             <Search className="absolute left-3 top-3 text-gray-400" size={16} />
//             <input
//               placeholder="Search leads..."
//               className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm w-80 
//                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* TABLE CONTAINER */}
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
//                       {["S.NO", "Name", "Type","Member Code","Date", "Mobile", "City","Preferred Location", "Property Type","Budget", "Source","Created By", "Actions"].map((h) => (
//                         <th key={h} className="px-5 py-4 font-semibold text-left border-b border-gray-200">
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {filtered.map((lead, idx) => (
//                       <tr
//                         key={lead._id}
//                         className={`${
//                           idx % 2 === 0 ? "bg-white" : "bg-gray-50"
//                         } hover:bg-blue-50/40 transition-colors`}
//                       >
//                         <td className="px-4 py-3 font-medium text-gray-900">
//                           {(currentPage - 1) * pageSize + idx + 1}
//                         </td>

//                         {/* NAME */}
//                         <td className="px-4 py-3 font-medium text-gray-900">
//                           <div className="flex flex-col">
//                             <span>{lead.customerName || lead.ownerName || "N/A"}</span>
//                             <span className="text-xs text-gray-400">{lead._id}</span>
//                           </div>
//                         </td>

//                         {/* TYPE */}
//                         <td className="px-5 py-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             lead.customerType === "tenant"
//                               ? "bg-blue-100 text-blue-600"
//                               : "bg-green-100 text-green-600"
//                           }`}>
//                             {lead.customerType === "tenant" ? "Tenant" : "Owner"}
//                           </span>
//                         </td>
//                         <td className="px-5 py-4 text-gray-700">{lead.memberCode || "N/A"}</td>

//                          <td className="px-5 py-4 text-gray-700">{new Date(lead.createdAt).toLocaleDateString()}</td>

//                         {/* MOBILE */}
//                         <td className="px-5 py-4 text-gray-700">{lead.mobileNumber}</td>

//                         {/* CITY */}
//                         <td className="px-5 py-4 text-gray-700">{lead.city}</td>

//                         <td className="px-5 py-4 text-gray-700">{lead.preferredLocation || "N/A"}</td>

//                         {/* PROPERTY TYPE */}
//                         <td className="px-5 py-4 text-gray-700">{lead.propertyType}</td>

//                         <td className="px-5 py-4 text-gray-700">{lead.budget ? `₹${lead.budget}` : "N/A"}</td>
                        
                       
//                         {/* SOURCE */}
//                         <td className="px-5 py-4 text-gray-700">{lead.source}</td>
//                         <td className="px-5 py-4 text-gray-700">{lead.createdBy?.name || "N/A"}</td>
                        

//                         {/* ACTIONS */}
//                         <td className="px-5 py-4 flex items-center gap-3">
//                           <button
//                             onClick={() => setSelected(lead)}
//                             className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs flex items-center gap-1 hover:bg-blue-200 transition"
//                             title="View details"
//                           >
//                             <Eye size={14} />
//                           </button>

//                           <button
//                             onClick={() => handleDelete(lead._id)}
//                             className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 text-xs flex items-center gap-1 hover:bg-red-200 transition"
//                             title="Delete lead"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* PAGINATION CONTROLS */}
//         {!isLoading && total > 0 && (
//           <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-md border border-gray-200 p-4 gap-4">
//             <div className="flex items-center gap-4">
//               <span className="text-sm text-gray-600">
//                 Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to {Math.min(currentPage * pageSize, total)} of {total} leads
//               </span>
//               <div className="flex items-center gap-2">
//                 <label htmlFor="pageSize" className="text-sm text-gray-600">Items per page:</label>
//                 <select
//                   id="pageSize"
//                   value={pageSize}
//                   onChange={handlePageSizeChange}
//                   className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 >
//                   <option value="5">5</option>
//                   <option value="10">10</option>
//                   <option value="20">20</option>
//                   <option value="50">50</option>
//                 </select>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
//                 title="Previous page"
//               >
//                 <ChevronLeft size={18} />
//               </button>
//               <div className="flex items-center gap-1">
//                 {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
//                   let pageNum;
//                   if (totalPages <= 5) {
//                     pageNum = i + 1;
//                   } else if (currentPage <= 3) {
//                     pageNum = i + 1;
//                   } else if (currentPage >= totalPages - 2) {
//                     pageNum = totalPages - 4 + i;
//                   } else {
//                     pageNum = currentPage - 2 + i;
//                   }
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => handlePageChange(pageNum)}
//                       className={`px-3 py-1 rounded-lg text-sm transition ${
//                         currentPage === pageNum
//                           ? "bg-blue-600 text-white"
//                           : "border border-gray-300 text-gray-600 hover:bg-gray-50"
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
//               </div>
//               <button
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
//                 title="Next page"
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* DETAILS MODAL / DRAWER */}
//         {selected && (
//           <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
//             <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />

//             <motion.div
//               initial={{ y: 30, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 z-10"
//             >
//               {/* HEADER */}
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900">
//                     {selected.customerName || selected.ownerName}
//                   </h3>
//                   <p className="text-sm text-gray-500">
//                     {selected.customerType === "tenant" ? "Tenant Lead" : "Owner Lead"}
//                   </p>
//                 </div>

//                 <button
//                   className="text-gray-400 hover:text-gray-600"
//                   onClick={() => setSelected(null)}
//                 >
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
//       </motion.div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import axiosInstance from "../../lib/axios.js";
import { notify } from "../../utils/toast.js";
import { useFetchLeads, useDeleteLead } from "../../hooks/useLeadQueries.js";

export default function AllLeads() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);

  // Registration Modal states
  const [showRegModal, setShowRegModal] = useState(false);
  const [regPlan, setRegPlan] = useState("");
  const [regDate, setRegDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  

  const {
    data: paginatedData = {
      leads: [],
      total: 0,
      totalPages: 0,
      page: 1,
    },
    isLoading,
  } = useFetchLeads(currentPage, pageSize);

  const { leads = [], total = 0, totalPages = 0 } = paginatedData;

  const deleteLeadMutation = useDeleteLead?.();

  // -------------------------------------------------
  // DELETE LEAD
  // -------------------------------------------------
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    deleteLeadMutation.mutate(id, {
      onSuccess: () => {
        notify.success("Lead deleted successfully");
        if (selected?._id === id) setSelected(null);
      },
      onError: (err) => {
        notify.error(err?.response?.data?.message || "Failed to delete lead");
      },
    });
  };

  // -------------------------------------------------
  // REGISTRATION — PROFESSIONAL WAY
  // -------------------------------------------------
  const handleRegisterLead = async () => {
    if (!regPlan.trim()) return notify.error("Plan name is required");

    try {
      const { data } = await axiosInstance.post("/registrations/add", {
        leadId: selected._id,
        planName: regPlan,
        registrationDate: regDate || new Date(),
      });

      notify.success(data.message);

      // Update selected lead locally (no need zustand or react-query)
      setSelected({
        ...selected,
        isRegistered: true,
        registrationDetails: {
          planName: regPlan,
          registrationDate: regDate,
          registeredBy: "You", // Optional: replace with actual user
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



  // -------------------------------------------------
  // PAGINATION
  // -------------------------------------------------
    const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

    // -------------------------------------------------
  // FILTERING
  // -------------------------------------------------
  const filtered = leads.filter((lead) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;

    return (
      lead.customerName?.toLowerCase().includes(q) ||
      lead.ownerName?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.mobileNumber?.toLowerCase().includes(q) ||
      lead.city?.toLowerCase().includes(q) ||
      lead.propertyType?.toLowerCase().includes(q) ||
      lead.source?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-[Inter]">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Leads</h1>
            <p className="text-sm text-gray-500">View and manage all leads</p>
          </div>

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              placeholder="Search leads..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm w-80 
                         focus:ring-2 focus:ring-blue-500 transition-all"
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
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide border-b">
                    {[
                      "S.NO",
                      "Name",
                      "Type",
                      "Date",
                      "Mobile",
                      "City",
                      "Property",
                      "Budget",
                      "Source",
                      "Registered?",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="px-5 py-3 font-semibold text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((lead, idx) => (
                    <tr
                      key={lead._id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50/40 transition`}
                    >
                      <td className="px-4 py-3">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-900">
                        {lead.customerName || lead.ownerName}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            lead.customerType === "tenant"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {lead.customerType}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">{lead.mobileNumber}</td>
                      <td className="px-4 py-3">{lead.city}</td>
                      <td className="px-4 py-3">{lead.propertyType}</td>
                      <td className="px-4 py-3">
                        {lead.budget ? `₹${lead.budget}` : "N/A"}
                      </td>
                      <td className="px-4 py-3">{lead.source}</td>

                      <td className="px-4 py-3">
                        {lead.isRegistered ? (
                          <span className="text-green-600 font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium">No</span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 flex items-center gap-3">
                        <button
                          onClick={() => setSelected(lead)}
                          className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs flex items-center gap-1 hover:bg-blue-200"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 text-xs hover:bg-red-200"
                        >
                          <Trash2 size={14} />
                        </button>

                        {!lead.isRegistered && (
                          <button
                            onClick={() => {
                             
                              setShowRegModal(true);
                            }}
                            className="px-3 py-1.5 rounded-md bg-green-100 text-green-700 text-xs hover:bg-green-200"
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

        {/* PAGINATION */}
      

        {isLoading ? null : total > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-md border border-gray-200 p-4 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to{" "}
                {Math.min(currentPage * pageSize, total)} of {total} leads
              </span>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="pageSize"
                  className="text-sm text-gray-600"
                >
                  Items per page:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                title="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  }
                  else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`} 
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                title="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 z-10"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selected.customerName || selected.ownerName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selected.customerType === "tenant"
                      ? "Tenant Lead"
                      : "Owner Lead"}
                  </p>
                </div>
                <button

                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSelected(null)}
                >
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
                  <p className="font-medium">
                    {selected.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">City</p>
                  <p className="font-medium">{selected.city}</p>
                </div>

                {selected.customerType === "tenant" && (
                  <>
                    <div>
                      <p className="text-gray-500">Preferred Location</p>
                      <p className="font-medium">
                        {selected.preferredLocation || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="font-medium">
                        {selected.budget ? `₹${selected.budget}` : "N/A"}
                      </p>
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
                      <p className="font-medium">
                        {selected.propertyLocation || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Area</p>
                      <p className="font-medium">{selected.area || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Landmark</p>
                      <p className="font-medium">
                        {selected.landmark || "N/A"}
                      </p>
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
                  <p className="text-xs text-gray-400 word-break">
                    {selected._id}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      

        {/* ---------------------------------------- */}
        {/* REGISTRATION MODAL */}
        {/* ---------------------------------------- */}
        {showRegModal &&  (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                Register Lead
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Plan Name</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    placeholder="Example: Premium Plan"
                    value={regPlan}
                    onChange={(e) => setRegPlan(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Registration Date
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowRegModal(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegisterLead}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
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
