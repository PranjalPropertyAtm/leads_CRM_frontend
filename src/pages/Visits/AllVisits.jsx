import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useAllVisits } from "../../hooks/useVisitQueries";
import VisitDetailsModal from "../../components/VisitDetailsModal";

export default function AllVisits() {
  const [filter, setFilter] = useState("");
  const [visitDetailsModal, setVisitDetailsModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { 
    data = { visits: [], total: 0, totalPages: 0, page: 1 }, 
    isLoading 
  } = useAllVisits(currentPage, pageSize, startDate || null, endDate || null);

  const { visits = [], total = 0, totalPages = 0 } = data;

  const filtered = visits.filter((item) => {
    const q = filter.toLowerCase(); // 🔥 filter query
    const name =
      item.lead?.customerName?.toLowerCase?.() ||
      item.lead?.ownerName?.toLowerCase?.() ||
      "";
    const location =
      item?.lead?.customerType === "owner"
        ? item?.lead?.propertyLocation?.toLowerCase?.() || ""
        : item?.propertyLocation?.toLowerCase?.() || "";
    return name.includes(q) || location.includes(q) || item.visitedBy?.name?.toLowerCase().includes(q);
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">All Visits</h1>
              <p className="text-sm text-gray-600 font-medium">View and manage all property visits</p>
            </div>

            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search visits..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm w-80 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all 
                           text-sm font-medium placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    min={startDate || undefined}
                    className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {(startDate || endDate) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setCurrentPage(1);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Clear Date Filter
                </button>
                {(startDate || endDate) && (
                  <p className="text-sm text-gray-600 mt-2">
                    {startDate && (
                      <span>
                        From: <span className="font-semibold text-gray-900">{new Date(startDate).toLocaleDateString()}</span>
                      </span>
                    )}
                    {endDate && (
                      <span className={startDate ? " ml-4" : ""}>
                        To: <span className="font-semibold text-gray-900">{new Date(endDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-500 font-medium">Loading visits...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-500 font-medium">No visits found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    {["S.No", "Lead Name", "Visited By", "Location", "Date", "Actions"].map(
                      (h) => (
                        <th key={h} className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-700 text-left">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filtered.map((visit, i) => (
                    <tr key={visit._id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-4 text-gray-600 font-semibold">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {visit.lead?.customerName ||
                            visit.lead?.ownerName ||
                            "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700 font-medium">{visit.visitedBy?.name || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">
                          {visit?.lead?.customerType === "owner"
                            ? visit?.lead?.propertyLocation || "—"
                            : visit?.propertyLocation || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700 font-medium">
                          {new Date(visit.visitDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedVisit(visit);
                            setVisitDetailsModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold 
                                     hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-lg border border-gray-200 p-4 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">
                Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to {Math.min(currentPage * pageSize, total)} of {total} visits
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-gray-600 font-medium">Items per page:</label>
                <select 
                  id="pageSize" 
                  value={pageSize} 
                  onChange={handlePageSizeChange} 
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
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
                className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium" 
                title="Previous page"
              >
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
                    <button 
                      key={pageNum} 
                      onClick={() => handlePageChange(pageNum)} 
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                        currentPage === pageNum 
                          ? "bg-blue-600 text-white shadow-md" 
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
                className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium" 
                title="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* DETAILS MODAL */}
        <VisitDetailsModal
          open={visitDetailsModal}
          onClose={() => setVisitDetailsModal(false)}
          visit={selectedVisit}
        />

      </div>
    </div>
  );
}
