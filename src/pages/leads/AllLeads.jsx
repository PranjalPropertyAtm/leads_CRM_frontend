
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
  MessageSquare,
  Bell,
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
import AddReminderModal from "../../components/AddReminderModal.jsx";
import VisitHistory from "../../components/VisitHistory.jsx";
// import SearchableSelect from "../../components/SearchableSelect.jsx";
import RegisterLeadModal from "../../components/RegisterLeadModal.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import { formatDate } from "../../utils/dateFormat.js";

export default function AllLeads() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: user } = useLoadUser();

  // page + filters
  const [filter, setFilter] = useState("");
  const isSearching = Boolean(filter.trim());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const prevPageSizeRef = useRef(null);

  useEffect(() => {
    // When searching, fetch all leads by setting a large page size; restore when cleared
    if (filter.trim()) {
      // capture original pageSize only on the first entry to searching
      if (prevPageSizeRef.current == null) prevPageSizeRef.current = pageSize;
      setCurrentPage(1);
      setPageSize(100000); // fetch all
    } else if (prevPageSizeRef.current != null) {
      // restore only when previously changed
      setPageSize(prevPageSizeRef.current);
      prevPageSizeRef.current = null;
      setCurrentPage(1);
    }
  }, [filter]);

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

  // reminders
  const [reminderModal, setReminderModal] = useState(false);
  const [reminderLead, setReminderLead] = useState(null);

  // status change confirmation
  const [statusChangeModal, setStatusChangeModal] = useState({
    isOpen: false,
    leadId: null,
    newStatus: null,
    currentStatus: null,
  });

  // when changing status to 'contacted', capture customer remark
  const [contactedModal, setContactedModal] = useState({
    isOpen: false,
    leadId: null,
    remark: '',
    currentStatus: null,
  });

  // leads query
  const {
    data: paginatedData = { leads: [], total: 0, totalPages: 0, page: 1 },
    isLoading,
  } = useFetchLeads(isSearching ? 1 : currentPage, pageSize);
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
  // const handleDelete = (id) => {
  //   if (!window.confirm("Are you sure you want to delete this lead?")) return;
  //   if (!deleteLeadMutation) return notify.error("Delete not available");

  //   deleteLeadMutation.mutate(id, {
  //     onSuccess: () => {
  //       notify.success("Lead deleted successfully");
  //       if (selected?._id === id) setSelected(null);
  //       queryClient.invalidateQueries(["leads"]);
  //     },
  //     onError: (err) => {
  //       notify.error(err?.response?.data?.message || "Failed to delete lead");
  //     },
  //   });
  // };

  const handlePageChange = (newPage) => {
    const maxPages = filter.trim() ? totalPagesForPagination : totalPages;
    if (newPage >= 1 && newPage <= maxPages) setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    // ignore changes while searching (client-side pagination used)
    if (filter.trim()) return;
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

    // location matching: preferredLocation (tenant) can be array or string, propertyLocation (owner) is string
    const matchLocation = (() => {
      const pref = lead.preferredLocation;
      const prop = lead.propertyLocation;

      if (Array.isArray(pref)) {
        return pref.some((p) => (p || "").toLowerCase().includes(q));
      }
      if (typeof pref === "string" && pref.toLowerCase().includes(q)) return true;
      if (typeof prop === "string" && prop.toLowerCase().includes(q)) return true;
      return false;
    })();

    // derive assignedTo name (handles cases where assignedTo is an id or populated object)
    const assignedName = (() => {
      const at = lead.assignedTo;
      if (!at) return "";
      if (typeof at === "string") {
        const emp = employees.find((e) => e._id === at);
        return emp?.name || "";
      }
      return at?.name || "";
    })();

    return (
      lead.customerName?.toLowerCase().includes(q) ||
      lead.ownerName?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.mobileNumber?.toLowerCase().includes(q) ||
      lead.city?.toLowerCase().includes(q) ||
      lead.propertyType?.toLowerCase().includes(q) ||
      lead.source?.toLowerCase().includes(q) ||
      lead.budget?.toLowerCase().includes(q) ||
      lead.customerType?.toLowerCase().includes(q) ||
      matchLocation ||
      (assignedName && assignedName.toLowerCase().includes(q))
    );
  });

  // DISPLAY LOGIC: when searching, paginate client-side at 5 per page; otherwise rely on server pagination
  const displayPageSize = isSearching ? 5 : pageSize;
  const totalFiltered = filtered.length;
  const totalForPagination = isSearching ? totalFiltered : total;
  const totalPagesForPagination = isSearching ? Math.max(1, Math.ceil(totalFiltered / displayPageSize)) : totalPages;

  // Ensure currentPage stays within bounds for filtered results
  // useEffect(() => {
  //   if (currentPage > totalPagesForPagination) setCurrentPage(1);
  // }, [totalPagesForPagination]);

  const displayLeads = isSearching
    ? filtered.slice(
      (currentPage - 1) * displayPageSize,
      currentPage * displayPageSize
    )
    : leads; // 🔥 IMPORTANT

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
    const MENU_WIDTH = 176; // w-44 ~ 176px

    const updatePosition = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();

      // Measure menu (if available) to decide whether to place above or below
      const menuHeight = menuRef.current ? menuRef.current.offsetHeight : 0;

      const spaceBelow = window.innerHeight - rect.bottom - 6; // px available below button
      let top;
      if (menuHeight && menuHeight > spaceBelow && rect.top > menuHeight + 12) {
        // place above the button if not enough space below and there is room above
        top = rect.top - menuHeight - 6;
      } else {
        // place below
        top = rect.top + rect.height + 6;
      }

      // Clamp vertically so menu stays in viewport (uses menuHeight if known)
      const maxTop = menuHeight ? Math.max(window.innerHeight - menuHeight - 8, 8) : Math.max(window.innerHeight - 200, 8);
      top = Math.min(Math.max(top, 8), maxTop);

      const leftRaw = rect.left + rect.width - MENU_WIDTH; // align right edge of menu with button
      const left = Math.min(Math.max(leftRaw, 8), window.innerWidth - MENU_WIDTH - 8);

      setCoords({ top, left });

      // If button scrolls out of view, close the menu
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpen(false);
      }
    };

    // Recalc after opening so we can measure the rendered menu and flip if necessary
    useEffect(() => {
      if (!open) return;
      const id = setTimeout(() => updatePosition(), 0);
      return () => clearTimeout(id);
    }, [open]);

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
      // use capture so updates run early during scroll
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll, true);
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
                className="bg-white shadow-xl border rounded-lg w-44 max-h-[60vh] overflow-y-auto z-[9999]"
                style={{ position: "fixed", top: coords.top, left: coords.left }}
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
    <div className="bg-slate-50 p-4 font-[Inter]">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Leads</h1>
            <p className="text-sm text-gray-600 font-medium">View and manage all leads</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              placeholder="Search leads..."
              className="pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium placeholder:text-gray-400"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading...</div>
          ) : displayLeads.length === 0
            ? (
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
                        "Date",
                        "Mobile",
                        "Location",
                        "Property",
                        "Budget",
                        "Source",
                        "Status",
                        "Registered",
                        "Visits",
                        "",
                      ].map((h) => (
                        <th key={h} className="px-3 py-4 font-semibold text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {displayLeads.map((lead, idx) => (
                      <tr
                        key={lead._id}
                        className={`hover:bg-blue-50/50 transition-colors group ${lead.employeeRemarks ? "bg-purple-50/30 border-l-4 border-l-purple-500" : ""
                          }`}
                      >
                        <td className="px-4 py-3 text-gray-600 font-semibold">{(currentPage - 1) * displayPageSize + idx + 1}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{lead.customerName || lead.ownerName}</span>
                            {lead.employeeRemarks && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold"
                                title="Customer Care has added remarks"
                              >
                                <MessageSquare size={12} />

                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1.5 text-xs rounded-full font-semibold ${lead.customerType === "tenant" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                              }`}
                          >
                            {lead.customerType}
                          </span>
                        </td>

                        <td className="px-4 py-3">{formatDate(lead.createdAt)}</td>
                        <td className="px-4 py-3">{lead.mobileNumber || "N/A"}</td>
                        <td className="px-4 py-3">{lead.customerType === "tenant" ? (Array.isArray(lead.preferredLocation) ? lead.preferredLocation.join(", ") : lead.preferredLocation) : lead.propertyLocation}</td>
                        <td className="px-4 py-3">{lead.propertyType || "N/A"}</td>
                        <td className="px-4 py-3">{lead.budget ? `₹${lead.budget}` : "N/A"}</td>
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

                              // If changing to contacted, open a small modal to capture customer remark
                              if (newStatus === "contacted") {
                                setContactedModal({
                                  isOpen: true,
                                  leadId: lead._id,
                                  remark: lead.customerRemark || '',
                                  currentStatus: currentStatus,
                                });
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

                        <td className="px-4 py-3">
                          {lead.isRegistered ? (
                            <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">Yes</span>
                          ) : (
                            <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">No</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">{lead.totalVisits || 0} Visits</span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <ActionMenu>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(lead);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-blue-600 transition"
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

                            {lead.createdBy?._id === user?._id && !lead.dealClosed && lead.status !== "deal_closed" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReminderModal(true);
                                  setReminderLead(lead);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-purple-600 transition"
                              >
                                <Bell size={14} /> Add Reminder
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

                            {/* {!lead.dealClosed && lead.status !== "deal_closed" && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(lead._id);
                              }} 
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-red-600 transition"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )} */}
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
        {!isLoading && totalForPagination > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-md border border-gray-200 p-4 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * displayPageSize + 1, totalForPagination)} to {Math.min(currentPage * displayPageSize, totalForPagination)} of {totalForPagination} leads
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-gray-600">Items per page:</label>
                <select id="pageSize" value={isSearching ? 5 : pageSize} onChange={handlePageSizeChange} className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" disabled={isSearching}>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || (isSearching && isLoading)} className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition" title="Previous page"><ChevronLeft size={18} /></button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPagesForPagination, 5) }).map((_, i) => {
                  let pageNum;
                  if (totalPagesForPagination <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPagesForPagination - 2) pageNum = totalPagesForPagination - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button key={pageNum} onClick={() => handlePageChange(pageNum)} disabled={isSearching && isLoading} className={`px-3 py-1 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${currentPage === pageNum ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPagesForPagination || (isSearching && isLoading)} className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition" title="Next page"><ChevronRight size={18} /></button>
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
                      <InfoRow label="Preferred Location" value={Array.isArray(selected.preferredLocation) ? selected.preferredLocation.join(", ") : (selected.preferredLocation || "N/A")} />
                      <InfoRow label="Budget" value={selected.budget ? `₹${selected.budget}` : "N/A"} />
                    </>
                  )}

                  {selected.customerType === "owner" && (
                    <>
                      <InfoRow label="Property Location" value={selected.propertyLocation || "N/A"} />
                      <InfoRow label="Area" value={selected.area ? `${selected.area} sq ft` : "N/A"} />
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

                  {selected.customerRemark && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 mb-1">Customer Remark</p>
                      <p className="font-medium text-gray-800">{selected.customerRemark}</p>
                    </div>
                  )}

                  {selected.employeeRemarks && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 mb-1">Internal Remarks</p>
                      <p className="font-medium text-gray-800 bg-blue-50 p-2 rounded">{selected.employeeRemarks}</p>
                    </div>
                  )}

                  {/* <div className="md:col-span-2">
                    <p className="text-gray-500">Lead ID</p>
                    <p className="text-xs font-mono text-gray-400 bg-gray-100 p-2 rounded">{selected._id}</p>
                  </div> */}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Registration Details</h3>
                {selected?.isRegistered ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoRow label="Plan Name" value={selected.registrationDetails?.planName} />
                    <InfoRow label="Member Code" value={selected.registrationDetails?.memberCode || "N/A"} />
                    <InfoRow label="Registration Date" value={selected.registrationDetails?.registrationDate ? formatDate(selected.registrationDetails.registrationDate) : "N/A"} />
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

        <RegisterLeadModal
          open={showRegModal}
          onClose={() => setShowRegModal(false)}
          employeeOptions={employeeOptions}
          lead={regLead}
          onSuccess={() => {
            queryClient.invalidateQueries(["leads"]);
          }}
        />

        {/* Contacted remark modal */}
        {contactedModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setContactedModal({ isOpen: false, leadId: null, remark: '', currentStatus: null })} />
            <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-10">
              <h3 className="text-lg font-semibold text-gray-900">Add customer remark</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">Add any remark provided by the customer when marking as contacted (optional).</p>

              <textarea
                rows={4}
                className="w-full border rounded p-2 text-sm"
                value={contactedModal.remark}
                onChange={(e) => setContactedModal((s) => ({ ...s, remark: e.target.value }))}
              />

              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setContactedModal({ isOpen: false, leadId: null, remark: '', currentStatus: null })} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">Cancel</button>
                <button
                  onClick={() => {
                    if (!contactedModal.leadId) return;
                    updateStatusMutation.mutate(
                      { id: contactedModal.leadId, status: 'contacted', customerRemark: contactedModal.remark },
                      {
                        onSuccess: () => {
                          notify.success('Status updated successfully');
                          // keep immediate UI in sync
                          queryClient.invalidateQueries({ queryKey: ['leads'] });
                          queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
                          setSelected((s) => (s && s._id === contactedModal.leadId ? { ...s, status: 'contacted', customerRemark: contactedModal.remark } : s));
                          setContactedModal({ isOpen: false, leadId: null, remark: '', currentStatus: null });
                        },
                        onError: (err) => {
                          notify.error(err?.response?.data?.message || 'Failed to update status');
                        },
                      }
                    );
                  }}
                  className="px-4 py-2 rounded-lg text-white bg-orange-600 hover:bg-orange-700"
                  disabled={updateStatusMutation.isPending}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Visits */}
        {visitModal && <AddVisitModal open={visitModal} onClose={() => setVisitModal(false)} lead={visitLead} />}
        {visitHistoryOpen && <VisitHistory open={visitHistoryOpen} onClose={() => setVisitHistoryOpen(false)} leadId={visitLead?._id} />}

        {/* Reminders */}
        {reminderModal && <AddReminderModal open={reminderModal} onClose={() => setReminderModal(false)} lead={reminderLead} />}



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


