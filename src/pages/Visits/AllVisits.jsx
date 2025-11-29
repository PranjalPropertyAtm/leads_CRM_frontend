import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye } from "lucide-react";
import { useAllVisits } from "../../hooks/useVisitQueries"; 
import VisitDetailsModal from "../../components/VisitDetailsModal";

export default function AllVisits() {
  const [filter, setFilter] = useState("");
  const [visitDetailsModal, setVisitDetailsModal] = useState(false);
const [selectedVisit, setSelectedVisit] = useState(null);

  const { data = [], isLoading } = useAllVisits();

  const filtered = data.filter((item) => {
    const q = filter.toLowerCase();
    return (
      item.lead?.customerName?.toLowerCase().includes(q) ||
      item.lead?.name?.toLowerCase().includes(q) ||
      item.propertyLocation?.toLowerCase().includes(q) ||
      item.visitedBy?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 min-h-screen bg-gray-50 font-[Inter]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">All Visits</h1>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              placeholder="Search visits..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border shadow-sm w-80"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow border">
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {["S.No", "Lead Name", "Visited By", "Location", "Date", "Actions"].map(
                      (h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((visit, i) => (
                    <tr key={visit._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        {visit.lead?.customerName ||
                          visit.lead?.name ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-3">{visit.visitedBy?.name}</td>
                      <td className="px-4 py-3">{visit.propertyLocation}</td>
                      <td className="px-4 py-3">
                        {new Date(visit.visitDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                      <button
  onClick={() => {
    setSelectedVisit(visit);
    setVisitDetailsModal(true);
  }}
  className="px-3 py-2 text-blue-600 hover:bg-gray-100 rounded-md text-sm"
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
