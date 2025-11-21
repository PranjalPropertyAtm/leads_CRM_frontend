import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, Search, X } from "lucide-react";
import { useMyLeads, useDeleteLead } from "../../hooks/useLeadQueries.js";
import { notify } from "../../utils/toast.js";

export default function MyLeads() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const { data = { leads: [], total: 0 }, isLoading } = useMyLeads();
  const { leads = [], total = 0 } = data;

  const deleteLeadMutation = useDeleteLead?.();

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    if (!deleteLeadMutation) {
      notify.error("Delete operation not available");
      return;
    }

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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">My Leads</h1>
            <p className="text-sm text-gray-500">Leads assigned to you</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              placeholder="Search my leads..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div>
            {isLoading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No leads found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide border-b">
                      {["S.NO", "Name", "Type", "Mobile", "City", "Property Type", "Source", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-4 font-semibold text-left border-b border-gray-200">{h}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((lead, idx) => (
                      <tr key={lead._id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50/40 transition-colors`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <div className="flex flex-col">
                            <span>{lead.customerName || lead.ownerName || "N/A"}</span>
                            <span className="text-xs text-gray-400">{lead._id}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${lead.customerType === "tenant" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                            {lead.customerType === "tenant" ? "Tenant" : "Owner"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-700">{lead.mobileNumber}</td>
                        <td className="px-5 py-4 text-gray-700">{lead.city}</td>
                        <td className="px-5 py-4 text-gray-700">{lead.propertyType}</td>
                        <td className="px-5 py-4 text-gray-700">{lead.source}</td>

                        <td className="px-5 py-4 flex items-center gap-3">
                          <button onClick={() => setSelected(lead)} className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs flex items-center gap-1 hover:bg-blue-200 transition" title="View details">
                            <Eye size={14} />
                          </button>

                          <button onClick={() => handleDelete(lead._id)} className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 text-xs flex items-center gap-1 hover:bg-red-200 transition" title="Delete lead">
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
      </motion.div>
    </div>
  );
}
