
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Trash2, Search, X, UserPlus, MoreVertical,ChevronLeft,ChevronRight } from "lucide-react";
import { useMyLeads, useDeleteLead } from "../../hooks/useLeadQueries.js";
import { useLoadUser } from "../../hooks/useAuthQueries.js";
import { createPortal } from "react-dom";
import { notify } from "../../utils/toast.js";
import axiosInstance from "../../lib/axios.js";

export default function MyLeads() {
  const { data: user } = useLoadUser();
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);

  // Registration Modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [regPlan, setRegPlan] = useState("");
  const [regDate, setRegDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [regLead, setRegLead] = useState(null);



  const {
    data = { leads: [], total: 0, totalPages: 0, page: 1 },
    isLoading,
  } = useMyLeads(currentPage, pageSize);

  const { leads = [], total = 0, totalPages = 0 } = data;

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
  if (!regLead?._id) return notify.error("Lead not selected!");

    try {
      const { data } = await axiosInstance.post("/registrations/add", {
        leadId: regLead._id,
        planName: regPlan,
        registrationDate: regDate || new Date(),
        registeredBy: user._id,
      });

      notify.success(data.message);

     

        setRegLead({
      ...regLead,
      isRegistered: true,
      registrationDetails: {
        planName: regPlan,
        registrationDate: regDate || new Date(),
        registeredBy: user._id,
      },
    });

      setShowRegModal(false);
      setRegPlan("");
      setRegDate("");
      setRegLead(null);
    } catch (error) {
      notify.error(
        error.response?.data?.message || "Failed to register customer"
      );
    }
  };

  // -----------------------------
  // FILTER
  // -----------------------------
  const filtered = leads.filter((lead) => {
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

  // Pagination handlers
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

function ActionMenu({ children }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const updatePosition = () => {
    if (!btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();

    setCoords({
      top: rect.top + rect.height + window.scrollY + 6,
      left: rect.left + window.scrollX - 120, 
    });
  };

  const toggleMenu = () => {
    updatePosition();
    setOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll & Resize reposition
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggleMenu}
        className="p-2 hover:bg-gray-100 rounded-full transition"
      >
        <MoreVertical size={18} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute bg-white shadow-xl border rounded-lg w-44 z-[9999]"
              style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
              }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}



  function InfoRow({ label, value }) {
    return (
      <div>
        <p className="text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    );
  }


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
                      "S.NO", "Name", "Type", "Member Code", "Date", "Mobile", "City", "Property", "Source", "Registered", " ",
                    ].map((h) => (
                      <th key={h} className="px-3 py-4 font-semibold">{h}</th>
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
                        <span className={`px-3 py-1 text-xs rounded-full ${lead.customerType === "tenant"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                          }`}>
                          {lead.customerType}
                        </span>
                      </td>

                      <td className="px-4 py-3">{lead.memberCode || "N/A"}</td>
                      <td className="px-4 py-3">{new Date(lead.createdAt).toLocaleDateString()}</td>
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
                      <td className="px-5 py-4 text-right">
                        <ActionMenu>
                          {/* VIEW */}
                          <button
                            onClick={() => setSelected(lead)}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm transition"
                          >
                            <Eye size={14} /> View Details
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-red-600 transition"
                          >
                            <Trash2 size={14} /> Delete
                          </button>

                          {/* REGISTER - only if lead created by current user */}
                          {!lead.isRegistered && (
                            <button
                              onClick={() => {
                                setRegLead(lead);
                                setShowRegModal(true);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-green-600 transition"
                            >
                              <UserPlus size={14} /> Register
                            </button>
                          )}
                        </ActionMenu>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-3 border-b">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selected.customerName || selected.ownerName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selected.customerType === "tenant"
                      ? "Tenant Lead"
                      : "Owner Lead"}
                  </p>
                </div>

                <button
                  className="text-gray-400 hover:text-gray-600 transition"
                  onClick={() => setSelected(null)}
                >
                  <X size={26} />
                </button>
              </div>

              {/* Lead Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Lead Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Common */}
                  <InfoRow label="Mobile Number" value={selected.mobileNumber} />
                  <InfoRow label="Email" value={selected.email || "N/A"} />
                  <InfoRow label="City" value={selected.city} />

                  {/* Tenant Fields */}
                  {selected.customerType === "tenant" && (
                    <>
                      <InfoRow
                        label="Preferred Location"
                        value={selected.preferredLocation || "N/A"}
                      />
                      <InfoRow
                        label="Budget"
                        value={selected.budget ? `₹${selected.budget}` : "N/A"}
                      />
                    </>
                  )}

                  {/* Owner Fields */}
                  {selected.customerType === "owner" && (
                    <>
                      <InfoRow
                        label="Property Location"
                        value={selected.propertyLocation || "N/A"}
                      />
                      <InfoRow
                        label="Area"
                        value={selected.area || "N/A"}
                      />
                      <InfoRow
                        label="Landmark"
                        value={selected.landmark || "N/A"}
                      />
                    </>
                  )}

                  <InfoRow label="Property Type" value={selected.propertyType} />
                  <InfoRow label="Sub Property Type" value={selected.subPropertyType} />
                  <InfoRow label="Source" value={selected.source} />

                  {selected.requirements && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 mb-1">Requirements</p>
                      <p className="font-medium text-gray-800">
                        {selected.requirements}
                      </p>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <p className="text-gray-500">Lead ID</p>
                    <p className="text-xs font-mono text-gray-400 bg-gray-100 p-2 rounded">
                      {selected._id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Registration Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Registration Details
                </h3>

                {selected?.isRegistered ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoRow
                      label="Plan Name"
                      value={selected.registrationDetails?.planName}
                    />
                    <InfoRow
                      label="Registration Date"
                      value={
                        selected.registrationDetails?.registrationDate
                          ? new Date(
                            selected.registrationDetails.registrationDate
                          ).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <InfoRow
                      label="Registered By"
                      value={
                        selected.registrationDetails?.registeredBy?.name ||
                        selected.registrationDetails?.registeredBy ||
                        "N/A"
                      }
                    />
                  </div>
                ) : (
                  <p className="text-sm text-red-500 font-medium">
                    ✖ This lead is not registered yet.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}


        {/* ---------------------------------------- */}
        {/* REGISTRATION MODAL — FIXED */}
        {/* ---------------------------------------- */}
        {showRegModal && regLead &&(
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-xl max-w-md w-full">

              <h2 className="text-xl font-semibold">Register Lead</h2>
              <p className="text-sm text-gray-600">
                {/* Lead: <b>{selected.tenantName || selected.ownerName}</b> */}
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
