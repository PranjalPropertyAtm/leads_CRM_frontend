const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
};

import React, { useMemo, useState } from "react";
import { Search, Eye, Users, ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useFetchCustomers } from "../../hooks/useCustomerQueries.js";
import { notify } from "../../utils/toast.js"

const buildLeadArray = (cust) => {
  const list = [cust.leadId, ...(cust.leadHistory || [])].filter(Boolean);
  // dedupe by _id to avoid double counting latest lead
  const map = new Map();
  list.forEach((item) => {
    const key = item?._id?.toString() || Math.random().toString();
    if (!map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
};

export default function AllCustomers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: paginatedData = { customers: [], total: 0, totalPages: 0, page: 1 }, isLoading } = useFetchCustomers(currentPage, pageSize);
  const { customers = [], total = 0, totalPages = 0 } = paginatedData;

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

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return customers.filter((c) => {
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.mobileNumber?.includes(q) ||
        c.city?.toLowerCase().includes(q)
      );
    });
  }, [customers, filter]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Customers</h1>
            <p className="text-sm text-gray-600 font-medium">Manage and view all registered customers</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              placeholder="Search customers..."
              className="pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm w-80 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                         text-sm font-medium placeholder:text-gray-400"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div>
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-gray-500 font-medium">Loading customers...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-500 font-medium">No customers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                      {["S.NO", "Name", "Type", "Phone", "City", "Leads", "Actions"].map((h) => (
                        <th key={h} className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-700 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((cust, idx) => {
                      const leadEntries = buildLeadArray(cust);
                      return (
                      <tr
                        key={cust._id}
                        className="hover:bg-blue-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 text-gray-600 font-semibold">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        {/* NAME */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{cust.name}</span>
                            <span className="text-xs text-gray-400 font-mono mt-0.5">{cust._id.slice(0, 8)}...</span>
                          </div>
                        </td>

                        {/* TYPE */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1.5 text-xs rounded-full font-semibold 
                            ${cust.customerType === "tenant"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"}`}
                          >
                            {cust.customerType}
                          </span>
                        </td>

                        {/* PHONE */}
                        <td className="px-6 py-4 text-gray-700 font-medium">{cust.mobileNumber || "N/A"}</td>

                        {/* CITY */}
                        <td className="px-6 py-4 text-gray-700 font-medium">{cust.city || "N/A"}</td>

                        {/* LEADS COUNT */}
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {leadEntries.length} {leadEntries.length === 1 ? 'Lead' : 'Leads'}
                          </span>
                        </td>

                        {/* ACTION BUTTONS */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelected(cust)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold 
                                     hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md
                                     flex items-center gap-2"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    )})}
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
                Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to {Math.min(currentPage * pageSize, total)} of {total} customers
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
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm transition ${currentPage === pageNum
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
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selected.name}
                  </h3>
                  <p className="text-sm text-gray-500">{selected.email || "No email"}</p>
                </div>

                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSelected(null)}
                >
                  <X size={22} />
                </button>
              </div>

              {/* CUSTOMER DETAILS */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">

                {/* PHONE */}
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{selected.mobileNumber || "N/A"}</p>
                </div>

                {/* TYPE */}
                <div>
                  <p className="text-gray-500">Customer Type</p>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium 
              ${selected.customerType === "tenant"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"}`}
                  >
                    {selected.customerType}
                  </span>
                </div>

                {/* CITY */}
                <div>
                  <p className="text-gray-500">City</p>
                  <p className="font-medium">{selected.city || "N/A"}</p>
                </div>

                {/* STATUS */}
                <div>
                  <p className="text-gray-500">Status</p>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                    {selected.status || "Lead"}
                  </span>
                </div>

                {/* TENANT FIELDS */}
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

                {/* OWNER FIELDS */}
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
                  </>
                )}

                {/* REQUIREMENTS */}
                {selected.requirements && (
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Requirements</p>
                    <p className="font-medium">{selected.requirements}</p>
                  </div>
                )}

                {/* LEAD HISTORY */}
                <div className="md:col-span-2 mt-2">
                  <p className="text-gray-500 mb-2">Lead History</p>
                  <div className="border rounded-lg divide-y">
                    {buildLeadArray(selected).map((lead, idx) => (
                      <div key={lead?._id || idx} className="flex items-center justify-between px-3 py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {lead?.customerName || lead?.ownerName || "Lead"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {lead?.propertyType || "-"} · {lead?.customerType || "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {lead?.status || "Lead"}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(lead?.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CUSTOMER ID */}
                <div className="md:col-span-2">
                  <p className="text-gray-500">Customer ID</p>
                  <p className="text-xs text-gray-400 break-all">{selected._id}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}


      </motion.div>
    </div>
  );
}


