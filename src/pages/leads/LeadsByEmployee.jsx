
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
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios.js";
import { notify } from "../../utils/toast.js";

import { useNavigate } from "react-router-dom";
import { useUpdateLeadStatus, useMarkDealClosed } from "../../hooks/useLeadQueries.js";
import { useFetchEmployees } from "../../hooks/useEmployeeQueries.js";
import { useLoadUser } from "../../hooks/useAuthQueries.js";

import AddVisitModal from "../../components/AddVisitModal.jsx";
import VisitHistory from "../../components/VisitHistory.jsx";
import RegisterLeadModal from "../../components/RegisterLeadModal.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import SearchableSelect from "../../components/SearchableSelect.jsx";

export default function LeadsByEmployee() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: user } = useLoadUser();

  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filter, setFilter] = useState("");
  const isSearching = Boolean(filter.trim());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const prevPageSizeRef = useRef(null);

  // Leads data
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [selected, setSelected] = useState(null);

  // Registration modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [regLead, setRegLead] = useState(null);

  // Visits
  const [visitModal, setVisitModal] = useState(false);
  const [visitHistoryOpen, setVisitHistoryOpen] = useState(false);
  const [visitLead, setVisitLead] = useState(null);

  // Status change confirmation
  const [statusChangeModal, setStatusChangeModal] = useState({
    isOpen: false,
    leadId: null,
    newStatus: null,
    currentStatus: null,
  });

  // When changing status to 'contacted', capture customer remark
  const [contactedModal, setContactedModal] = useState({
    isOpen: false,
    leadId: null,
    remark: '',
    currentStatus: null,
  });

  // Deal closed modal
  const [dealClosedModal, setDealClosedModal] = useState({
    isOpen: false,
    leadId: null,
  });

  // Employees query
  const {
    data: employeesData,
    isLoading: empLoading,
  } = useFetchEmployees(1, 1000);

  const employees = employeesData?.employees || [];

  // Map to select options
  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name}${emp.designation ? " — " + emp.designation : ""}`,
  }));

  // Mutations
  const updateStatusMutation = useUpdateLeadStatus();
  const markDealClosedMutation = useMarkDealClosed();

  // Fetch leads when filters change
  useEffect(() => {
    if (selectedEmployee) {
      fetchLeads();
    }
  }, [selectedEmployee, startDate, endDate, currentPage, pageSize]);

  useEffect(() => {
    // When searching, fetch all leads by setting a large page size; restore when cleared
    if (filter.trim()) {
      if (prevPageSizeRef.current == null) prevPageSizeRef.current = pageSize;
      setCurrentPage(1);
      setPageSize(100000); // fetch all
    } else if (prevPageSizeRef.current != null) {
      setPageSize(prevPageSizeRef.current);
      prevPageSizeRef.current = null;
      setCurrentPage(1);
    }
  }, [filter]);

  // Fetch leads function
  const fetchLeads = async () => {
    if (!selectedEmployee) return;
    
    setIsLoading(true);
    try {
      const params = {
        page: isSearching ? 1 : currentPage,
        limit: pageSize,
        createdBy: selectedEmployee,
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axiosInstance.get("/leads/all", { params });
      const data = response.data;

      setLeads(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching leads:", error);
      notify.error(error?.response?.data?.message || "Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter leads locally for search
  const filtered = leads.filter((lead) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;

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

  // Display logic
  const displayPageSize = isSearching ? 5 : pageSize;
  const totalFiltered = filtered.length;
  const totalForPagination = isSearching ? totalFiltered : total;
  const totalPagesForPagination = isSearching
    ? Math.max(1, Math.ceil(totalFiltered / displayPageSize))
    : totalPages;

  const displayLeads = isSearching
    ? filtered.slice(
        (currentPage - 1) * displayPageSize,
        currentPage * displayPageSize
      )
    : leads;

  // Handlers
  const handlePageChange = (newPage) => {
    const maxPages = filter.trim() ? totalPagesForPagination : totalPages;
    if (newPage >= 1 && newPage <= maxPages) setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    if (filter.trim()) return;
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleEmployeeChange = (e) => {
    const value = e.target.value;
    setSelectedEmployee(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedEmployee("");
    setStartDate("");
    setEndDate("");
    setFilter("");
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
          setStatusChangeModal({
            isOpen: false,
            leadId: null,
            newStatus: null,
            currentStatus: null,
          });
          fetchLeads();
        },
        onError: (err) => {
          notify.error(err?.response?.data?.message || "Failed to update status");
          setStatusChangeModal({
            isOpen: false,
            leadId: null,
            newStatus: null,
            currentStatus: null,
          });
        },
      }
    );
  };

  // Handle mark deal closed confirmation
  const handleConfirmDealClosed = () => {
    if (!dealClosedModal.leadId) return;

    markDealClosedMutation.mutate(dealClosedModal.leadId, {
      onSuccess: () => {
        notify.success("Lead marked as deal closed");
        setDealClosedModal({ isOpen: false, leadId: null });
        fetchLeads();
      },
      onError: (err) => {
        notify.error(err?.response?.data?.message || "Failed to mark as deal closed");
        setDealClosedModal({ isOpen: false, leadId: null });
      },
    });
  };

  // ActionMenu component
  function ActionMenu({ children }) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const btnRef = useRef(null);
    const menuRef = useRef(null);
    const MENU_WIDTH = 176;

    const updatePosition = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current ? menuRef.current.offsetHeight : 0;
      const spaceBelow = window.innerHeight - rect.bottom - 6;
      let top;
      if (menuHeight && menuHeight > spaceBelow && rect.top > menuHeight + 12) {
        top = rect.top - menuHeight - 6;
      } else {
        top = rect.top + rect.height + 6;
      }
      const maxTop = menuHeight
        ? Math.max(window.innerHeight - menuHeight - 8, 8)
        : Math.max(window.innerHeight - 200, 8);
      top = Math.min(Math.max(top, 8), maxTop);
      const leftRaw = rect.left + rect.width - MENU_WIDTH;
      const left = Math.min(
        Math.max(leftRaw, 8),
        window.innerWidth - MENU_WIDTH - 8
      );
      setCoords({ top, left });
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpen(false);
      }
    };

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
        if (
          btnRef.current.contains(e.target) ||
          menuRef.current?.contains(e.target)
        ) {
          return;
        }
        setOpen(false);
      }
      if (open) {
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
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
      };
    }, [open]);

    const childrenWithClose = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          onClick: (e) => {
            e.stopPropagation();
            if (child.props.onClick) {
              child.props.onClick(e);
            }
            setTimeout(() => closeMenu(), 100);
          },
        });
      }
      return child;
    });

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

  // InfoRow helper
  function InfoRow({ label, value }) {
    return (
      <div>
        <p className="text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value ?? "N/A"}</p>
      </div>
    );
  }

  // Get selected employee name
  const selectedEmployeeName =
    employees.find((e) => e._id === selectedEmployee)?.name || "Employee";

  return (
    <div className="bg-slate-50 p-4 font-[Inter]">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Leads by Employee
            </h1>
            <p className="text-sm text-gray-600 font-medium">
              View leads created by specific employees
            </p>
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee
              </label>
              <SearchableSelect
                value={selectedEmployee}
                onChange={handleEmployeeChange}
                options={employeeOptions}
                placeholder="Select employee..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {selectedEmployee && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing leads for: <span className="font-semibold text-gray-900">{selectedEmployeeName}</span>
                {startDate && (
                  <span className="ml-4">
                    From: <span className="font-semibold">{new Date(startDate).toLocaleDateString()}</span>
                  </span>
                )}
                {endDate && (
                  <span className="ml-4">
                    To: <span className="font-semibold">{new Date(endDate).toLocaleDateString()}</span>
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          {!selectedEmployee ? (
            <div className="py-10 text-center text-gray-500">
              Please select an employee to view leads
            </div>
          ) : isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading...</div>
          ) : displayLeads.length === 0 ? (
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
                      <th key={h} className="px-3 py-4 font-semibold text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {displayLeads.map((lead, idx) => (
                    <tr
                      key={lead._id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-4 py-3 text-gray-600 font-semibold">
                        {(currentPage - 1) * displayPageSize + idx + 1}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">
                          {lead.customerName || lead.ownerName}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1.5 text-xs rounded-full font-semibold ${
                            lead.customerType === "tenant"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {lead.customerType}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{lead.mobileNumber || "N/A"}</td>
                      <td className="px-4 py-3">
                        {lead.customerType === "tenant"
                          ? Array.isArray(lead.preferredLocation)
                            ? lead.preferredLocation.join(", ")
                            : lead.preferredLocation
                          : lead.propertyLocation}
                      </td>
                      <td className="px-4 py-3">{lead.propertyType || "N/A"}</td>
                      <td className="px-4 py-3">
                        {lead.budget ? `₹${lead.budget}` : "N/A"}
                      </td>
                      <td className="px-4 py-3">{lead.source || "N/A"}</td>

                      <td className="px-4 py-3">
                        <select
                          value={lead.status || "new"}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            const currentStatus = lead.status || "new";

                            if (newStatus === "deal_closed") {
                              setStatusChangeModal({
                                isOpen: true,
                                leadId: lead._id,
                                newStatus: newStatus,
                                currentStatus: currentStatus,
                              });
                              e.target.value = currentStatus;
                              return;
                            }

                            if (newStatus === "contacted") {
                              setContactedModal({
                                isOpen: true,
                                leadId: lead._id,
                                remark: lead.customerRemark || "",
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
                                  fetchLeads();
                                },
                                onError: (err) => {
                                  notify.error(
                                    err?.response?.data?.message ||
                                      "Failed to update status"
                                  );
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
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                            No
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                          {lead.totalVisits || 0} Visits
                        </span>
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

                          {lead.createdBy?._id === user?._id &&
                            !lead.dealClosed &&
                            lead.status !== "deal_closed" && (
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

                          {!lead.isRegistered &&
                            lead.createdBy?._id === user?._id &&
                            !lead.dealClosed &&
                            lead.status !== "deal_closed" && (
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

                          {lead.createdBy?._id === user?._id &&
                            !lead.dealClosed &&
                            lead.status !== "deal_closed" && (
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

                          {!lead.dealClosed &&
                            lead.status !== "deal_closed" &&
                            lead.createdBy?._id === user?._id && (
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
        {!isLoading &&
          selectedEmployee &&
          totalForPagination > 0 && (
            <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-md border border-gray-200 p-4 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * displayPageSize + 1,
                    totalForPagination
                  )}{" "}
                  to {Math.min(currentPage * displayPageSize, totalForPagination)}{" "}
                  of {totalForPagination} leads
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
                    value={isSearching ? 5 : pageSize}
                    onChange={handlePageSizeChange}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={isSearching}
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
                  disabled={
                    currentPage === 1 || (isSearching && isLoading)
                  }
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  title="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({
                    length: Math.min(totalPagesForPagination, 5),
                  }).map((_, i) => {
                    let pageNum;
                    if (totalPagesForPagination <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPagesForPagination - 2)
                      pageNum = totalPagesForPagination - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isSearching && isLoading}
                        className={`px-3 py-1 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          currentPage === pageNum
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
                  disabled={
                    currentPage === totalPagesForPagination ||
                    (isSearching && isLoading)
                  }
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  title="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

        {/* Selected Lead Drawer */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]"
            >
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

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Lead Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Mobile Number" value={selected.mobileNumber} />
                  <InfoRow
                    label="Email"
                    value={selected.email || "N/A"}
                  />
                  <InfoRow label="City" value={selected.city} />

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
                      <InfoRow
                        label="Preferred Location"
                        value={
                          Array.isArray(selected.preferredLocation)
                            ? selected.preferredLocation.join(", ")
                            : selected.preferredLocation || "N/A"
                        }
                      />
                      <InfoRow
                        label="Budget"
                        value={
                          selected.budget ? `₹${selected.budget}` : "N/A"
                        }
                      />
                    </>
                  )}

                  {selected.customerType === "owner" && (
                    <>
                      <InfoRow
                        label="Property Location"
                        value={selected.propertyLocation || "N/A"}
                      />
                      <InfoRow
                        label="Area"
                        value={
                          selected.area ? `${selected.area} sq ft` : "N/A"
                        }
                      />
                      <InfoRow
                        label="Landmark"
                        value={selected.landmark || "N/A"}
                      />
                    </>
                  )}

                  <InfoRow
                    label="Property Type"
                    value={selected.propertyType}
                  />
                  <InfoRow
                    label="Sub Property Type"
                    value={selected.subPropertyType}
                  />
                  <InfoRow label="Source" value={selected.source} />

                  {selected.requirements && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 mb-1">Requirements</p>
                      <p className="font-medium text-gray-800">
                        {selected.requirements}
                      </p>
                    </div>
                  )}

                  {selected.customerRemark && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 mb-1">Customer Remark</p>
                      <p className="font-medium text-gray-800">
                        {selected.customerRemark}
                      </p>
                    </div>
                  )}
                </div>
              </div>

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
                      label="Member Code"
                      value={
                        selected.registrationDetails?.memberCode || "N/A"
                      }
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
                        selected.registrationDetails?.registeredBy?.name || "NA"
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

        <RegisterLeadModal
          open={showRegModal}
          onClose={() => setShowRegModal(false)}
          employeeOptions={employeeOptions}
          lead={regLead}
          onSuccess={() => {
            queryClient.invalidateQueries(["leads"]);
            fetchLeads();
          }}
        />

        {/* Contacted remark modal */}
        {contactedModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() =>
                setContactedModal({
                  isOpen: false,
                  leadId: null,
                  remark: "",
                  currentStatus: null,
                })
              }
            />
            <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                Add customer remark
              </h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Add any remark provided by the customer when marking as
                contacted (optional).
              </p>

              <textarea
                rows={4}
                className="w-full border rounded p-2 text-sm"
                value={contactedModal.remark}
                onChange={(e) =>
                  setContactedModal((s) => ({
                    ...s,
                    remark: e.target.value,
                  }))
                }
              />

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() =>
                    setContactedModal({
                      isOpen: false,
                      leadId: null,
                      remark: "",
                      currentStatus: null,
                    })
                  }
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!contactedModal.leadId) return;
                    updateStatusMutation.mutate(
                      {
                        id: contactedModal.leadId,
                        status: "contacted",
                        customerRemark: contactedModal.remark,
                      },
                      {
                        onSuccess: () => {
                          notify.success("Status updated successfully");
                          queryClient.invalidateQueries({ queryKey: ["leads"] });
                          setSelected((s) =>
                            s && s._id === contactedModal.leadId
                              ? {
                                  ...s,
                                  status: "contacted",
                                  customerRemark: contactedModal.remark,
                                }
                              : s
                          );
                          setContactedModal({
                            isOpen: false,
                            leadId: null,
                            remark: "",
                            currentStatus: null,
                          });
                          fetchLeads();
                        },
                        onError: (err) => {
                          notify.error(
                            err?.response?.data?.message ||
                              "Failed to update status"
                          );
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
        {visitModal && (
          <AddVisitModal
            open={visitModal}
            onClose={() => setVisitModal(false)}
            lead={visitLead}
          />
        )}
        {visitHistoryOpen && (
          <VisitHistory
            open={visitHistoryOpen}
            onClose={() => setVisitHistoryOpen(false)}
            leadId={visitLead?._id}
          />
        )}

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

        {/* Status Change Confirmation Modal */}
        <ConfirmModal
          isOpen={statusChangeModal.isOpen}
          title="Change Lead Status"
          description={`Are you sure you want to change the status from "${statusChangeModal.currentStatus}" to "${statusChangeModal.newStatus}"?`}
          onCancel={() => {
            setStatusChangeModal({
              isOpen: false,
              leadId: null,
              newStatus: null,
              currentStatus: null,
            });
          }}
          onConfirm={handleConfirmStatusChange}
          confirmLabel="Yes, Change Status"
          cancelLabel="Cancel"
          loading={updateStatusMutation.isPending}
        />
      </motion.div>
    </div>
  );
}
