

// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { Eye, Trash2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
// import { useFetchEmployees, useDeleteEmployee } from "../../hooks/useEmployeeQueries.js";
// import { notify } from "../../utils/toast.js";

// export default function AllEmployees() {
//   const [filter, setFilter] = useState("");
//   const [selected, setSelected] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [toDelete, setToDelete] = useState(null);

//   const { data: paginatedData = { employees: [], total: 0, totalPages: 0, page: 1 }, isLoading } = useFetchEmployees(currentPage, pageSize);
//   const { employees = [], total = 0, totalPages = 0 } = paginatedData;
//   const deleteMutation = useDeleteEmployee();

//   const handleDelete = (id) => {
//     if (!id) return;

//     setShowConfirmModal(false);
//     setToDelete(null);

//     deleteMutation.mutate(id, {
//       onSuccess: () => {
//         notify.success("Employee deleted");
//         if (selected?._id === id) setSelected(null);
//       },
//       onError: (err) => {
//         const msg = err?.response?.data?.message || "Failed to delete";
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

//   const filtered = employees.filter((emp) => {
//     const q = filter.trim().toLowerCase();
//     if (!q) return true;

//     return (
//       emp.name?.toLowerCase().includes(q) ||
//       emp.email?.toLowerCase().includes(q) ||
//       emp.phone?.toLowerCase().includes(q) ||
//       emp.designation?.toLowerCase().includes(q)
//     );
//   });


//   return (
//     <div className="min-h-screen  bg-slate-50 p-4 font-[Inter] ">
//       <motion.div
//         initial={{ opacity: 0, y: 8 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-7xl mx-auto"
//       >

//         {/* HEADER */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-semibold text-gray-900">Employees</h1>
//             <p className="text-sm text-gray-500">Manage your internal team</p>
//           </div>

//           <div className="relative">
//             <Search className="absolute left-3 top-3 text-gray-400" size={16} />
//             <input
//               placeholder="Search employees..."
//               className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm w-80 
//                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* TABLE CONTAINER */}
//         <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//           <div >
//             {isLoading ? (
//               <div className="py-10 text-center text-gray-500">Loading...</div>
//             ) : filtered.length === 0 ? (
//               <div className="py-10 text-center text-gray-500">No employees found</div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full border-separate border-spacing-0 text-sm">
//                   <thead>
//                     <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide border-b">
//                       {["S.NO", "Name", "Email", "Phone", "Designation", "Role", "Actions"].map((h) => (
//                         <th key={h} className="px-5 py-4 font-semibold text-left border-b border-gray-200">
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {filtered.map((emp, idx) => (
//                       <tr
//                         key={emp._id}
//                         className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
//                           } hover:bg-blue-50/40 transition-colors`}
//                       >
//                         <td className="px-4 py-3 font-medium text-gray-900">
//                           {(currentPage - 1) * pageSize + idx + 1}
//                         </td>
//                         {/* NAME */}
//                         <td className="px-4 py-3 font-medium text-gray-900">
//                           <div className="flex flex-col">
//                             {emp.name}
//                             <span className="text-xs text-gray-400">{emp._id}</span>
//                           </div>
//                         </td>

//                         {/* EMAIL */}
//                         <td className="px-5 py-4 text-gray-700">{emp.email}</td>



//                         {/* PHONE */}
//                         <td className="px-5 py-4 text-gray-700">{emp.phone}</td>

//                         {/* DESIGNATION */}
//                         <td className="px-5 py-4 text-gray-700">{emp.designation}</td>

//                         {/* ROLE */}
//                         <td className="px-3 py-4 ">
//                           <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
//                             {emp.role || "employee"}
//                           </span>
//                         </td>

//                         {/* PERMISSIONS */}
//                         {/* <td className="px-5 py-4">
//                           <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
//                             {(emp.permissions || []).length}
//                           </span>
//                         </td> */}

//                         {/* ACTION BUTTONS */}
//                         <td className="px-5 py-4 flex items-center gap-3">
//                           <button
//                             onClick={() => setSelected(emp)}
//                             className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs flex items-center gap-1 hover:bg-blue-200 transition"
//                           >
//                             <Eye size={14} />
//                           </button>

//                           <button
//                             onClick={() => {
//                               setToDelete(emp._id);
//                               setShowConfirmModal(true);
//                             }}
//                             className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 text-xs flex items-center gap-1 hover:bg-red-200 transition"
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
//                 Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to {Math.min(currentPage * pageSize, total)} of {total} employees
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
//                       className={`px-3 py-1 rounded-lg text-sm transition ${currentPage === pageNum
//                         ? "bg-blue-600 text-white"
//                         : "border border-gray-300 text-gray-600 hover:bg-gray-50"
//                         }`}
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

//         {/* MODAL / DRAWER */}
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
//                   <h3 className="text-xl font-semibold text-gray-900">{selected.name}</h3>
//                   <p className="text-sm text-gray-500">{selected.email}</p>
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
//                   <p className="text-gray-500">Phone</p>
//                   <p className="font-medium">{selected.phone}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-500">Designation</p>
//                   <p className="font-medium">{selected.designation}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-500">Role</p>
//                   <p className="font-medium">{selected.role}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-500">Permissions</p>
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {selected.permissions?.map((p) => (
//                       <span
//                         key={p}
//                         className="px-3 py-1 bg-purple-200 text-purple-700 rounded-lg text-xs font-medium"
//                       >
//                         {p}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="md:col-span-2">
//                   <p className="text-gray-500">Employee ID</p>
//                   <p className="text-xs text-gray-400">{selected._id}</p>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}

//         {showConfirmModal && (
//           <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
//             <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
//               <h2 className="text-xl font-semibold text-gray-800 mb-3">Confirm Deletion</h2>
//               <p className="text-gray-600 mb-5">Are you sure you want to delete <b>"{toDelete?.label}"</b>?</p>
//               <div className="flex justify-end gap-3">
//                 <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">Cancel</button>
//                 <button onClick={handleDelete(toDelete?._id)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">Yes, Delete</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useFetchEmployees, useDeleteEmployee } from "../../hooks/useEmployeeQueries.js";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import { notify } from "../../utils/toast.js";

export default function AllEmployees() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toDelete, setToDelete] = useState(null); // will store full employee object

  const { data: paginatedData = { employees: [], total: 0, totalPages: 0, page: 1 }, isLoading } = useFetchEmployees(currentPage, pageSize);
  const { employees = [], total = 0, totalPages = 0 } = paginatedData;
  const deleteMutation = useDeleteEmployee();

  const handleDelete = (id) => {
    if (!id) return;

    // Close modal and clear selected toDelete immediately for UI
    setShowConfirmModal(false);
    setToDelete(null);

    deleteMutation.mutate(id, {
      onSuccess: () => {
        notify.success("Employee deleted");
        if (selected?._id === id) setSelected(null);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || "Failed to delete";
        notify.error(msg);
      },
    });
  };

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

  const filtered = employees.filter((emp) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;

    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.phone?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen  bg-slate-50 p-4 font-[Inter] ">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Employees</h1>
            <p className="text-sm text-gray-500">Manage your internal team</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div>
            {isLoading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No employees found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide border-b">
                      {["S.NO", "Name", "Email", "Phone", "Designation", "Role", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-4 font-semibold text-left border-b border-gray-200">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((emp, idx) => (
                      <tr
                        key={emp._id}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/40 transition-colors`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-900">
                          <div className="flex flex-col">
                            {emp.name}
                            <span className="text-xs text-gray-400">{emp._id}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-700">{emp.email}</td>
                        <td className="px-5 py-4 text-gray-700">{emp.phone}</td>
                        <td className="px-5 py-4 text-gray-700">{emp.designation}</td>

                        <td className="px-3 py-4 ">
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                            {emp.role || "employee"}
                          </span>
                        </td>

                        <td className="px-5 py-4 flex items-center gap-3">
                          <button
                            onClick={() => setSelected(emp)}
                            className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs flex items-center gap-1 hover:bg-blue-200 transition"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => {
                              // store the whole employee object in toDelete
                              setToDelete(emp);
                              setShowConfirmModal(true);
                            }}
                            className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 text-xs flex items-center gap-1 hover:bg-red-200 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* PAGINATION CONTROLS */}
        {!isLoading && total > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-md border border-gray-200 p-4 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to {Math.min(currentPage * pageSize, total)} of {total} employees
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-gray-600">Items per page:</label>
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
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition" title="Previous page">
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`px-3 py-1 rounded-lg text-sm transition ${currentPage === pageNum ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition" title="Next page">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* DETAILS DRAWER */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />

            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selected.name}</h3>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                </div>

                <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelected(null)}>
                  <X size={22} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{selected.phone}</p>
                </div>

                <div>
                  <p className="text-gray-500">Designation</p>
                  <p className="font-medium">{selected.designation}</p>
                </div>

                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium">{selected.role}</p>
                </div>

                <div>
                  <p className="text-gray-500">Permissions</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selected.permissions?.map((p) => (
                      <span key={p} className="px-3 py-1 bg-purple-200 text-purple-700 rounded-lg text-xs font-medium">{p}</span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-gray-500">Employee ID</p>
                  <p className="text-xs text-gray-400">{selected._id}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <ConfirmModal
          isOpen={showConfirmModal}
          title="Confirm Deletion"
          description={`Are you sure you want to delete "${toDelete?.name || toDelete?._id}"?`}
          onCancel={() => {
            setShowConfirmModal(false);
            setToDelete(null);
          }}
          onConfirm={() => handleDelete(toDelete?._id)}
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          loading={deleteMutation.isLoading}
          destructive
        />
      </motion.div>
    </div>
  );
}
