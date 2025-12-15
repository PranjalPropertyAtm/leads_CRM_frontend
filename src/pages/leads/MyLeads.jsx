



import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Trash2,
  Search,
  X,
  UserPlus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  HousePlus,
  Edit,
  CheckCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMyLeads, useDeleteLead, useUpdateLeadStatus, useMarkDealClosed } from "../../hooks/useLeadQueries.js";
import { useLoadUser } from "../../hooks/useAuthQueries.js";
import { useFetchEmployees } from "../../hooks/useEmployeeQueries.js";
import { createPortal } from "react-dom";
import { notify } from "../../utils/toast.js";
import axiosInstance from "../../lib/axios.js";
import { useNavigate } from "react-router-dom";
import AddVisitModal from "../../components/AddVisitModal.jsx";
import VisitHistory from "../../components/VisitHistory.jsx";
import RegisterLeadModal from "../../components/RegisterLeadModal.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";


export default function MyLeads() {
  const navigate = useNavigate();
  const { data: user } = useLoadUser(); // {data: user}
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const queryClient = useQueryClient();

  // Registration Modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [regPlan, setRegPlan] = useState("");
  const [regDate, setRegDate] = useState("");
  const [regLead, setRegLead] = useState(null);

  // Visits
  const [visitModal, setVisitModal] = useState(false);
  const [visitHistoryOpen, setVisitHistoryOpen] = useState(false);
  const [visitLead, setVisitLead] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  // NOTE: make sure your useMyLeads accepts (page, limit) and uses them in queryKey & request params:
  // queryKey: ['leads', 'my', page, limit]
  // axios.get('/leads/my', { params: { page, limit }})
  const {
    data = { leads: [], total: 0, totalPages: 0, page: 1 },
    isLoading,
  } = useMyLeads(currentPage, pageSize);

  const { leads = [], total = 0, totalPages = 0 } = data;

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
  

  const deleteLeadMutation = useDeleteLead?.();
  const updateStatusMutation = useUpdateLeadStatus();
  const markDealClosedMutation = useMarkDealClosed();
 
   
  const [statusChangeModal, setStatusChangeModal] = useState({
    isOpen: false,
    leadId: null,
    newStatus: null,
    currentStatus: null,
  }); 

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
  // Handle mark deal closed confirmation
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

  // ------------- Delete -------------
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    if (!deleteLeadMutation) {
      notify.error("Delete operation not configured");
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

  // ------------- Register -------------
  const handleRegisterLead = async () => {
    if (!regPlan.trim()) return notify.error("Plan name is required");
    if (!regLead?._id) return notify.error("Lead not selected!");

    try {
      const { data } = await axiosInstance.post("/registrations/add", {
        leadId: regLead._id,
        planName: regPlan,
        registrationDate: regDate || new Date(),
        registeredBy: user?._id, // ensure user exists
      });

      notify.success(data.message || "Registered successfully");

        queryClient.setQueryData(["myLeads", currentPage, pageSize], (old) => {
      if (!old) return old;

      return {
        ...old,
        leads: old.leads.map((l) =>
          l._id === regLead._id
            ? {
                ...l,
                isRegistered: true,
                registrationDetails: {
                  planName: regPlan,
                  registrationDate: regDate || new Date(),
                  registeredBy: user,
                },
              }
            : l
        ),
      };
    });

    // 🔥 Force Refetch (Guaranteed update)
    queryClient.invalidateQueries(["myLeads"]);

      setShowRegModal(false);
      setRegPlan("");
      setRegDate("");
      setRegLead(null);
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to register customer");
    }
  };

  // ------------- Filtering -------------
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

  // ------------- Pagination handlers -------------
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // ------------- ActionMenu component (fixed) -------------
  function ActionMenu({ children }) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);
    const menuRef = useRef(null);
    const MENU_WIDTH = 176; // w-44 ~ 176px

    const updatePosition = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const top = rect.top + rect.height + window.scrollY + 6;
      const leftRaw = rect.left + window.scrollX - MENU_WIDTH + rect.width; // prefer right-aligned under button
      // clamp horizontally so it doesn't go off-screen
      const left = Math.min(
        Math.max(leftRaw, 8 + window.scrollX),
        window.innerWidth - MENU_WIDTH - 8 + window.scrollX
      );
      setCoords({ top, left });
    };

    const toggleMenu = () => {
      updatePosition();
      setOpen((p) => !p);
    };

    // close on outside click — check both button and menu
    useEffect(() => {
      const handler = (e) => {
        if (!btnRef.current || !menuRef.current) return;
        if (!btnRef.current.contains(e.target) && !menuRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    // reposition on scroll/resize when open
    useEffect(() => {
      if (!open) return;
      const onScroll = () => updatePosition();
      const onResize = () => updatePosition();
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
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
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.12 }}
                className="absolute bg-white shadow-xl border rounded-lg z-9999"
                style={{
                  position: "absolute",
                  top: coords.top,
                  left: coords.left,
                  width: MENU_WIDTH,
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
    <div className="bg-slate-50 p-4 font-[Inter]">
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
                      "S.NO",
                      "Name",
                      "Type",
                      // "Member Code",
                      "Date",
                      "Mobile",
                      "City",
                      "Property",
                      "Source",
                      "Status",
                      "Registered",
                      "Visits",
                      " ",
                    ].map((h) => (
                      <th key={h} className="px-3 py-4 font-semibold text-left">{h}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((lead, idx) => (
                    <tr key={lead._id} className="hover:bg-blue-50/40 transition">
                      <td className="px-4 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>

                      <td className="px-4 py-3 font-medium">
                        <div className="flex flex-col">
                          <span>{lead.customerName || lead.ownerName || "N/A"}</span>
                          {/* <span className="text-xs text-gray-400">{lead._id}</span> */}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 text-xs rounded-full ${lead.customerType === "tenant" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                          {lead.customerType}
                        </span>
                      </td>

                      {/* <td className="px-4 py-3">{lead.memberCode || "N/A"}</td> */}
                      <td className="px-4 py-3">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{lead.mobileNumber || "N/A"}</td>
                      <td className="px-4 py-3">{lead.city || "N/A"}</td>
                      <td className="px-4 py-3">{lead.propertyType || "N/A"}</td>
                      <td className="px-4 py-3">{lead.source || "N/A"}</td>

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
                          className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${
                            lead.status === "deal_closed"
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

                      <td className="px-4 py-3">
                        {lead.isRegistered ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-red-500 font-medium">No</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {lead.totalVisits || 0} Visits
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-right">
                        <ActionMenu>
                          {/* VIEW */}
                          <button
                            onClick={() => {
                              setSelected(lead);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-blue-600 transition"
                          >
                            <Eye size={14} /> View Details
                          </button>

                          {/* EDIT - only if lead created by current user and not closed */}
                          {lead.createdBy?._id === user?._id && !lead.dealClosed && lead.status !== "deal_closed" && (
                            <button
                              onClick={() => {
                                navigate(`/edit-lead/${lead._id}`);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-blue-600 transition"
                            >
                              <Edit size={14} /> Edit Lead
                            </button>
                          )}

                          {/* REGISTER - only if lead created by current user & not registered & not closed */}
                          {!lead.isRegistered && lead.createdBy?._id === user?._id && !lead.dealClosed && lead.status !== "deal_closed" && (
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

                          {/* VIEW VISITS */}
                          <button
                            onClick={() => {
                              setVisitHistoryOpen(true);
                              setVisitLead(lead);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-blue-600 transition"
                          >
                            <Eye size={14}/> View Visits
                          </button>

                          {/* ADD VISIT - only for creator and not closed */}
                          {lead.createdBy?._id === user?._id && !lead.dealClosed && lead.status !== "deal_closed" && (
                            <button
                              onClick={() => {
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
                              onClick={() => {
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

                           {/* DELETE - only if not closed */}
                          {!lead.dealClosed && lead.status !== "deal_closed" && (
                          <button
                            onClick={() => handleDelete(lead._id)}
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

        {/* PAGINATION */}
        {isLoading ? null : total > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-md border border-gray-200 p-4 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to {Math.min(currentPage * pageSize, total)} of {total} leads
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-gray-600">Items per page:</label>
                <select id="pageSize" value={pageSize} onChange={handlePageSizeChange} className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50">
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages || 1, 5) }).map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm ${currentPage === pageNum ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* DETAILS DRAWER/MODAL */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="flex justify-between items-start pb-3 border-b">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{selected.customerName || selected.ownerName}</h2>
                  <p className="text-sm text-gray-500">{selected.customerType === "tenant" ? "Tenant Lead" : "Owner Lead"}</p>
                </div>

                <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelected(null)}><X size={26} /></button>
              </div>

              {/* Lead Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Lead Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Mobile Number" value={selected.mobileNumber} />
                  <InfoRow label="Email" value={selected.email || "N/A"} />
                  <InfoRow label="City" value={selected.city} />
                  {selected.customerType === "tenant" ? (
                    <>
                      <InfoRow label="Preferred Location" value={selected.preferredLocation || "N/A"} />
                      <InfoRow label="Budget" value={selected.budget ? `₹${selected.budget}` : "N/A"} />
                    </>
                  ) : (
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

              {/* Registration */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Registration Details</h3>
                {selected?.isRegistered ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoRow label="Plan Name" value={selected.registrationDetails?.planName} />
                    <InfoRow label="Registration Date" value={selected.registrationDetails?.registrationDate ? new Date(selected.registrationDetails.registrationDate).toLocaleDateString() : "N/A"} />
                    <InfoRow label="Registered By" value={selected.registrationDetails?.registeredBy?.name} />
                  </div>
                ) : (
                  <p className="text-sm text-red-500 font-medium">✖ This lead is not registered yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Registration Modal */}
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
