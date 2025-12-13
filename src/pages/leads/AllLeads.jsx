



import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  MoreVertical,
  HousePlus,
  Edit,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios.js";
import { notify } from "../../utils/toast.js";

import { useNavigate } from "react-router-dom";
import { useFetchLeads, useDeleteLead, useUpdateLeadStatus, useMarkDealClosed } from "../../hooks/useLeadQueries.js";
import { useFetchEmployees } from "../../hooks/useEmployeeQueries.js";
import { useLoadUser } from "../../hooks/useAuthQueries.js";

import AddVisitModal from "../../components/AddVisitModal.jsx";
import VisitHistory from "../../components/VisitHistory.jsx";
// import SearchableSelect from "../../components/SearchableSelect.jsx";
import RegisterLeadModal from "../../components/RegisterLeadModal.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";

export default function AllLeads() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: user } = useLoadUser();

  // page + filters
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [selected, setSelected] = useState(null);

  // registration modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [regLead, setRegLead] = useState(null);
  const [regPlan, setRegPlan] = useState("");
  const [regDate, setRegDate] = useState("");
  const [regBy, setRegBy] = useState(""); // should store employee _id
  const [memberCode, setMemberCode] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // visits
  const [visitModal, setVisitModal] = useState(false);
  const [visitHistoryOpen, setVisitHistoryOpen] = useState(false);
  const [visitLead, setVisitLead] = useState(null);

  // status change confirmation
  const [statusChangeModal, setStatusChangeModal] = useState({
    isOpen: false,
    leadId: null,
    newStatus: null,
    currentStatus: null,
  });

  // leads query
  const {
    data: paginatedData = { leads: [], total: 0, totalPages: 0, page: 1 },
    isLoading,
  } = useFetchLeads(currentPage, pageSize);
  const { leads = [], total = 0, totalPages = 0 } = paginatedData;

  // employees query (fetch many for select)
  const {
    data: employeesData,
    isLoading: empLoading,
    isError: empError,
    error: empErrorObj,
  } = useFetchEmployees(1, 1000);

  const employees = employeesData?.employees || [];

  // map to select options
  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name}${emp.designation ? " — " + emp.designation : ""}`,
  }));

  // ensure current user present as fallback option if employees fetch blocked
  if ((empError || employeeOptions.length === 0) && user) {
    const exists = employeeOptions.find((o) => o.value === user._id);
    if (!exists) {
      employeeOptions.unshift({
        value: user._id,
        label: `${user.name} (${user.designation || "You"})`,
      });
    }
  }

  // delete hook
  const deleteLeadMutation = useDeleteLead();
  const updateStatusMutation = useUpdateLeadStatus();
  const markDealClosedMutation = useMarkDealClosed();



  // -------------------------
  // Handlers
  // -------------------------
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    if (!deleteLeadMutation) return notify.error("Delete not available");

    deleteLeadMutation.mutate(id, {
      onSuccess: () => {
        notify.success("Lead deleted successfully");
        if (selected?._id === id) setSelected(null);
        queryClient.invalidateQueries(["leads"]);
      },
      onError: (err) => {
        notify.error(err?.response?.data?.message || "Failed to delete lead");
      },
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Handle status change confirmation
  const handleConfirmStatusChange = () => {
    if (!statusChangeModal.leadId || !statusChangeModal.newStatus) return;

    updateStatusMutation.mutate(
      { id: statusChangeModal.leadId, status: statusChangeModal.newStatus },
      {
        onSuccess: () => {
          notify.success("Status updated successfully");
          setStatusChangeModal({ isOpen: false, leadId: null, newStatus: null, currentStatus: null });
        },
        onError: (err) => {
          notify.error(err?.response?.data?.message || "Failed to update status");
          setStatusChangeModal({ isOpen: false, leadId: null, newStatus: null, currentStatus: null });
        },
      }
    );
  };

  // Handle mark deal closed confirmation
  const [dealClosedModal, setDealClosedModal] = useState({
    isOpen: false,
    leadId: null,
  });

  const handleConfirmDealClosed = () => {
    if (!dealClosedModal.leadId) return;

    markDealClosedMutation.mutate(dealClosedModal.leadId, {
      onSuccess: () => {
        notify.success("Lead marked as deal closed");
        setDealClosedModal({ isOpen: false, leadId: null });
      },
      onError: (err) => {
        notify.error(err?.response?.data?.message || "Failed to mark as deal closed");
        setDealClosedModal({ isOpen: false, leadId: null });
      },
    });
  };

  // filter leads locally
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

  // -------------------------
  // Registration
  // -------------------------
  const handleRegisterLead = async () => {
    if (!regPlan?.trim()) return notify.error("Plan name is required");
    if (!regLead?._id) return notify.error("Lead not selected!");
    if (!memberCode?.trim()) return notify.error("Member Code is required");

    // registeredBy must be an employee _id — fallback to current user id
    const registeredById = regBy || user?._id;
    if (!registeredById) return notify.error("RegisteredBy is required");

    setRegLoading(true);
    try {
      const payload = {
        leadId: regLead._id,
        planName: regPlan,
        registrationDate: regDate || new Date(),
        registeredBy: registeredById, // send ID
        memberCode: memberCode,
      };

      const { data } = await axiosInstance.post("/registrations/add", payload);

      notify.success(data?.message || "Lead registered");

      // invalidate queries that show leads so UI refreshes
      queryClient.invalidateQueries(["leads"]);
      queryClient.invalidateQueries(["myLeads"]);
      // reset modal
      setShowRegModal(false);
      setRegPlan("");
      setRegDate("");
      setRegLead(null);
      setRegBy("");
      setMemberCode("");
    } catch (err) {
      console.error("Register error:", err?.response?.data || err);
      notify.error(err?.response?.data?.message || "Failed to register customer");
    } finally {
      setRegLoading(false);
    }
  };

  // -------------------------
  // Small ActionMenu component (kept simple)
  // -------------------------
  function ActionMenu({ children }) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    const updatePosition = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height + window.scrollY + 6,
        left: rect.left + window.scrollX - 120,
      });
    };

    const toggleMenu = (e) => {
      e.stopPropagation();
      updatePosition();
      setOpen((p) => !p);
    };

    const closeMenu = () => {
      setOpen(false);
    };

    useEffect(() => {
      function handler(e) {
        if (!btnRef.current || !menuRef.current) return;
        // Don't close if clicking on button or menu
        if (btnRef.current.contains(e.target) || menuRef.current?.contains(e.target)) {
          return;
        }
        setOpen(false);
      }
      if (open) {
        // Use a small delay to ensure menu is rendered
        setTimeout(() => {
          document.addEventListener("mousedown", handler);
        }, 0);
        return () => document.removeEventListener("mousedown", handler);
      }
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const onScroll = () => updatePosition();
      const onResize = () => updatePosition();
      window.addEventListener("scroll", onScroll);
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
      };
    }, [open]);

    // Clone children and add closeMenu prop
    const childrenWithClose = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          onClick: (e) => {
            e.stopPropagation();
            if (child.props.onClick) {
              child.props.onClick(e);
            }
            // Close menu after action
            setTimeout(() => closeMenu(), 100);
          },
        });
      }
      return child;
    });

    return (
      <>
        <button ref={btnRef} onClick={toggleMenu} className="p-2 hover:bg-gray-100 rounded-full transition">
          <MoreVertical size={18} />
        </button>

        {createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -5 }}
                transition={{ duration: 0.12 }}
                className="absolute bg-white shadow-xl border rounded-lg w-44 z-[9999]"
                style={{ position: "absolute", top: coords.top, left: coords.left }}
                onClick={(e) => e.stopPropagation()}
              >
                {childrenWithClose}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </>
    );
  }

  // -------------------------
  // InfoRow small helper
  // -------------------------
  function InfoRow({ label, value }) {
    return (
      <div>
        <p className="text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value ?? "N/A"}</p>
      </div>
    );
  }

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Leads</h1>
            <p className="text-sm text-gray-600 font-medium">View and manage all leads</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              placeholder="Search leads..."
              className="pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm w-80 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                         text-sm font-medium placeholder:text-gray-400"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-500 font-medium">Loading leads...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-500 font-medium">No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
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
                      "Status",
                      "Registered",
                      "Visits",
                      "",
                    ].map((h) => (
                      <th key={h} className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-gray-700 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filtered.map((lead, idx) => (
                    <tr
                      key={lead._id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-gray-600 font-semibold">{(currentPage - 1) * pageSize + idx + 1}</td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{lead.customerName || lead.ownerName}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 text-xs rounded-full font-semibold ${lead.customerType === "tenant" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                            }`}
                        >
                          {lead.customerType}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-700 font-medium">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{lead.mobileNumber || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{lead.city || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{lead.propertyType || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{lead.budget ? `₹${lead.budget}` : "N/A"}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{lead.source || "N/A"}</td>

                      <td className="px-4 py-3">
                        <select
                          value={lead.status || "new"}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            const currentStatus = lead.status || "new";

                            // Ask for confirmation if changing to deal_closed
                            if (newStatus === "deal_closed") {
                              setStatusChangeModal({
                                isOpen: true,
                                leadId: lead._id,
                                newStatus: newStatus,
                                currentStatus: currentStatus,
                              });
                              // Reset select to current value temporarily
                              e.target.value = currentStatus;
                              return;
                            }

                            updateStatusMutation.mutate(
                              { id: lead._id, status: newStatus },
                              {
                                onSuccess: () => {
                                  notify.success("Status updated successfully");
                                },
                                onError: (err) => {
                                  notify.error(err?.response?.data?.message || "Failed to update status");
                                  // Reset to previous value on error
                                  e.target.value = currentStatus;
                                },
                              }
                            );
                          }}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${lead.status === "deal_closed"
                              ? "bg-green-100 text-green-700"
                              : lead.status === "lost"
                                ? "bg-red-100 text-red-700"
                                : lead.status === "visit_completed"
                                  ? "bg-blue-100 text-blue-700"
                                  : lead.status === "visit_scheduled"
                                    ? "bg-purple-100 text-purple-700"
                                    : lead.status === "registered"
                                      ? "bg-indigo-100 text-indigo-700"
                                      : lead.status === "contacted"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-gray-100 text-gray-700"
                            }`}
                          disabled={
                            updateStatusMutation.isPending ||
                            lead.dealClosed ||
                            lead.status === "deal_closed" ||
                            lead.createdBy?._id !== user?._id
                          }
                          title={
                            lead.dealClosed || lead.status === "deal_closed"
                              ? "Deal is closed. Cannot modify status."
                              : lead.createdBy?._id !== user?._id
                                ? "Only the creator can change status"
                                : ""
                          }
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="registered">Registered</option>
                          <option value="visit_scheduled">Visit Scheduled</option>
                          <option value="visit_completed">Visit Completed</option>
                          <option value="deal_closed">Deal Closed</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        {lead.isRegistered ? (
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">Yes</span>
                        ) : (
                          <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">No</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">{lead.totalVisits || 0} Visits</span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <ActionMenu>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(lead);
                            }} 
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm transition"
                          >
                            <Eye size={14} /> View Details
                          </button>

                          {lead.createdBy?._id === user?._id && !lead.dealClosed && lead.status !== "deal_closed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/edit-lead/${lead._id}`);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-blue-600 transition"
                            >
                              <Edit size={14} /> Edit Lead
                            </button>
                          )}

                          {!lead.isRegistered && lead.createdBy?._id === user?._id && !lead.dealClosed && lead.status !== "deal_closed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRegLead(lead);
                                setShowRegModal(true);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-green-600 transition"
                            >
                              <UserPlus size={14} /> Register
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisitHistoryOpen(true);
                              setVisitLead(lead);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-blue-600 transition"
                          >
                            <Eye size={14} /> View Visits
                          </button>

                          {lead.createdBy?._id === user?._id && !lead.dealClosed && lead.status !== "deal_closed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setVisitModal(true);
                                setVisitLead(lead);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-green-600 transition"
                            >
                              <HousePlus size={14} /> Add Visit
                            </button>
                          )}

                          {!lead.dealClosed && lead.status !== "deal_closed" && lead.createdBy?._id === user?._id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDealClosedModal({
                                  isOpen: true,
                                  leadId: lead._id,
                                });
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-green-700 font-medium transition"
                            >
                              <CheckCircle size={14} /> Mark Deal Closed
                            </button>
                          )}

                          {!lead.dealClosed && lead.status !== "deal_closed" && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(lead._id);
                              }} 
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-red-600 transition"
                            >
                              <Trash2 size={14} /> Delete
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

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-md border border-gray-200 p-4 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to {Math.min(currentPage * pageSize, total)} of {total} leads
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-gray-600">Items per page:</label>
                <select id="pageSize" value={pageSize} onChange={handlePageSizeChange} className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition" title="Previous page"><ChevronLeft size={18} /></button>

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

              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition" title="Next page"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}

        {/* Selected Lead Drawer */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start pb-3 border-b">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{selected.customerName || selected.ownerName}</h2>
                  <p className="text-sm text-gray-500">{selected.customerType === "tenant" ? "Tenant Lead" : "Owner Lead"}</p>
                </div>

                <button className="text-gray-400 hover:text-gray-600 transition" onClick={() => setSelected(null)}><X size={26} /></button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Lead Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Mobile Number" value={selected.mobileNumber} />
                  <InfoRow label="Email" value={selected.email || "N/A"} />
                  <InfoRow label="City" value={selected.city} />

                  {/* Assisted (Assigned Employee) */}
                  {selected.assignedTo && (
                    <InfoRow
                      label="Assisted To"
                      value={
                        typeof selected.assignedTo === "string"
                          ? selected.assignedTo
                          : selected.assignedTo?.name || "N/A"
                      }
                    />
                  )}

                  {/* SHOW ONLY TO ADMIN */}
                  {selected.createdBy && (
                    <InfoRow
                      label="Created By"
                      value={
                        typeof selected.createdBy === "string"
                          ? selected.createdBy
                          : selected.createdBy?.name || "N/A"
                      }
                    />
                  )}

                  {selected.customerType === "tenant" && (
                    <>
                      <InfoRow label="Preferred Location" value={selected.preferredLocation || "N/A"} />
                      <InfoRow label="Budget" value={selected.budget ? `₹${selected.budget}` : "N/A"} />
                    </>
                  )}

                  {selected.customerType === "owner" && (
                    <>
                      <InfoRow label="Property Location" value={selected.propertyLocation || "N/A"} />
                      <InfoRow label="Area" value={selected.area || "N/A"} />
                      <InfoRow label="Landmark" value={selected.landmark || "N/A"} />
                    </>
                  )}

                  <InfoRow label="Property Type" value={selected.propertyType} />
                  <InfoRow label="Sub Property Type" value={selected.subPropertyType} />
                  <InfoRow label="Source" value={selected.source} />

                  {selected.requirements && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 mb-1">Requirements</p>
                      <p className="font-medium text-gray-800">{selected.requirements}</p>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <p className="text-gray-500">Lead ID</p>
                    <p className="text-xs font-mono text-gray-400 bg-gray-100 p-2 rounded">{selected._id}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Registration Details</h3>
                {selected?.isRegistered ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoRow label="Plan Name" value={selected.registrationDetails?.planName} />
                    <InfoRow label="Registration Date" value={selected.registrationDetails?.registrationDate ? new Date(selected.registrationDetails.registrationDate).toLocaleDateString() : "N/A"} />
                    {/* SAFELY render registeredBy: either populated object or a string */}
                    <InfoRow label="Registered By" value={selected.registrationDetails?.registeredBy?.name || "NA"} />
                  </div>
                ) : (
                  <p className="text-sm text-red-500 font-medium">✖ This lead is not registered yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Registration Modal */}
        {/* {showRegModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-800">Register Lead</h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Plan Name</label>
                  <input className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="Example: Premium Plan" value={regPlan} onChange={(e) => setRegPlan(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Member Code</label>
                  <input className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="Enter Member Code" value={memberCode} onChange={(e) => setMemberCode(e.target.value)} />
                </div>

                <div>
                  <SearchableSelect label="Registered By" name="registeredBy" value={regBy} options={employeeOptions} onChange={(e) => setRegBy(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Registration Date</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 mt-1" value={regDate} onChange={(e) => setRegDate(e.target.value)} />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setShowRegModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button onClick={handleRegisterLead} disabled={regLoading} className={`px-4 py-2 ${regLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white rounded-lg`}>
                    {regLoading ? "Registering..." : "Confirm Registration"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )} */}

        <RegisterLeadModal
          open={showRegModal}
          onClose={() => setShowRegModal(false)}
          employeeOptions={employeeOptions}
          lead={regLead}
          onSuccess={() => {
            queryClient.invalidateQueries(["leads"]);
          }}
        />


        {/* Visits */}
        {visitModal && <AddVisitModal open={visitModal} onClose={() => setVisitModal(false)} lead={visitLead} />}
        {visitHistoryOpen && <VisitHistory open={visitHistoryOpen} onClose={() => setVisitHistoryOpen(false)} leadId={visitLead?._id} />}

        {/* Status Change Confirmation Modal */}
        <ConfirmModal
          isOpen={statusChangeModal.isOpen}
          title="Mark Lead as Deal Closed"
          description="Are you sure you want to mark this lead as deal closed? This action cannot be undone and the lead will become read-only. You will no longer be able to edit, delete, or modify this lead."
          onCancel={() => {
            setStatusChangeModal({ isOpen: false, leadId: null, newStatus: null, currentStatus: null });
          }}
          onConfirm={handleConfirmStatusChange}
          confirmLabel="Yes, Mark as Closed"
          cancelLabel="Cancel"
          loading={updateStatusMutation.isPending}
        />

        {/* Mark Deal Closed Confirmation Modal */}
        <ConfirmModal
          isOpen={dealClosedModal.isOpen}
          title="Mark Lead as Deal Closed"
          description="Are you sure you want to mark this lead as deal closed? This action cannot be undone and the lead will become read-only. You will no longer be able to edit, delete, or modify this lead."
          onCancel={() => {
            setDealClosedModal({ isOpen: false, leadId: null });
          }}
          onConfirm={handleConfirmDealClosed}
          confirmLabel="Yes, Mark as Closed"
          cancelLabel="Cancel"
          loading={markDealClosedMutation.isPending}
        />
      </motion.div>
    </div>
  );
}


