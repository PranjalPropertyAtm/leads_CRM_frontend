import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, PlusCircle } from "lucide-react";
import { useMyVisits } from "../../hooks/useVisitQueries";
import VisitDetailsModal from "../../components/VisitDetailsModal";
import AddVisitModal from "../../components/AddVisitModal";

export default function MyVisits() {
  const [filter, setFilter] = useState("");
const [visitDetailsModal, setVisitDetailsModal] = useState(false);
const [selectedVisit, setSelectedVisit] = useState(null);

  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data = [], isLoading } = useMyVisits();

  const filtered = data.filter((visit) => {
    const q = filter.toLowerCase();
    return (
      visit.lead?.customerName?.toLowerCase().includes(q) ||
      visit.propertyLocation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 min-h-screen bg-gray-50 font-[Inter]">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-semibold">My Visits</h1>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                placeholder="Search..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border shadow-sm w-72"
              />
            </div>

            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircle size={18} /> Add Visit
            </button>
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
                    {["S.No", "Lead Name", "Property Location", "Date", "Actions"].map(
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
                      <td className="px-4 py-3">
                        {visit.lead?.customerName || visit.lead?.name}
                      </td>
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

        {/* MODALS */}
        <VisitDetailsModal
  open={visitDetailsModal}
  onClose={() => setVisitDetailsModal(false)}
  visit={selectedVisit}
/>


        {addModalOpen && (
          <AddVisitModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
        )}
      </div>
    </div>
  );
}
