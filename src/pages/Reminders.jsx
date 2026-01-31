import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Clock, CheckCircle, Trash2, Search, ChevronLeft, ChevronRight, User, Plus, X } from "lucide-react";
import { useAllReminders, useMarkReminderCompleted, useDeleteReminder } from "../hooks/useReminderQueries";
import { useFetchEmployees } from "../hooks/useEmployeeQueries";
import { useLoadUser } from "../hooks/useAuthQueries";
import { notify } from "../utils/toast";
import { formatDate } from "../utils/dateFormat";
import AddReminderModal from "../components/AddReminderModal";
import CancelReminderModal from "../components/CancelReminderModal";

export default function Reminders() {
  const { data: user, isLoading: userLoading } = useLoadUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCompleted, setIsCompleted] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reminderToCancel, setReminderToCancel] = useState(null);

  const { data: employeesData } = useFetchEmployees(1, 1000);
  const employees = employeesData?.employees || [];
  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name}`,
  }));

  const { 
    data = { reminders: [], total: 0, totalPages: 0, page: 1 }, 
    isLoading 
  } = useAllReminders(currentPage, pageSize, {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    isCompleted: isCompleted || undefined,
    employeeId: employeeId || undefined,
  });

  const { reminders = [], total = 0, totalPages = 0 } = data;

  const markCompletedMutation = useMarkReminderCompleted();
  const deleteMutation = useDeleteReminder();

  // Filter reminders by search query
  const filteredReminders = reminders.filter((reminder) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      reminder.title?.toLowerCase().includes(query) ||
      reminder.description?.toLowerCase().includes(query) ||
      reminder.lead?.customerName?.toLowerCase().includes(query) ||
      reminder.lead?.ownerName?.toLowerCase().includes(query) ||
      reminder.createdBy?.name?.toLowerCase().includes(query)
    );
  });

  const handleComplete = (reminderId) => {
    markCompletedMutation.mutate(reminderId, {
      onSuccess: () => {
        notify.success("Reminder marked as completed");
      },
      onError: (err) => {
        notify.error(err?.response?.data?.message || "Failed to mark reminder as completed");
      },
    });
  };

  // const handleDelete = (reminderId) => {
  //   if (window.confirm("Are you sure you want to delete this reminder?")) {
  //     deleteMutation.mutate(reminderId, {
  //       onSuccess: () => {
  //         notify.success("Reminder deleted successfully");
  //       },
  //       onError: (err) => {
  //         notify.error(err?.response?.data?.message || "Failed to delete reminder");
  //       },
  //     });
  //   }
  // };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setIsCompleted("");
    if (user?.role !== "employee") {
      setEmployeeId("");
    }
    setSearchQuery("");
    setCurrentPage(1);
  };

  const incompleteReminders = filteredReminders.filter((r) => !r.isCompleted && !r.isCancelled);
  const completedReminders = filteredReminders.filter((r) => r.isCompleted);
  const cancelledReminders = filteredReminders.filter((r) => r.isCancelled);

  const handleCancelClick = (reminder) => {
    setReminderToCancel(reminder);
    setCancelModalOpen(true);
  };

  const isAdmin = user?.role !== "employee";

  return (
    <div className="bg-slate-50 p-6 font-[Inter]">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {isAdmin ? "All Reminders" : "My Reminders"}
            </h1>
            <p className="text-sm text-gray-600 font-medium">
              {isAdmin 
                ? "View and manage all reminders created by employees" 
                : "View and manage your reminders"}
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 font-semibold text-sm"
            >
              <Plus size={18} />
              <span>Add Reminder</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border p-6 mb-6">
          <div className={`grid grid-cols-1 ${isAdmin ? "md:grid-cols-5" : "md:grid-cols-4"} gap-4`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search reminders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium placeholder:text-gray-400"
                />
              </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={isCompleted}
                onChange={(e) => {
                  setIsCompleted(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
              >
                <option value="">All Status</option>
                <option value="false">Pending</option>
                <option value="true">Completed</option>
              </select>
            </div>

            {/* Employee filter - Admin only */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <select
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
                >
                  <option value="">All Employees</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp.value} value={emp.value}>
                      {emp.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {(startDate || endDate || isCompleted || (isAdmin && employeeId) || searchQuery) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Reminders List */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-500 font-medium">Loading reminders...</p>
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 font-medium">No reminders found</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Incomplete Reminders */}
              {incompleteReminders.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Pending Reminders ({incompleteReminders.length})
                  </h2>
                  <div className="space-y-3">
                    {incompleteReminders.map((reminder) => {
                      const isPastTime = (() => {
                        if (!reminder.reminderTime) {
                          const reminderDate = new Date(reminder.reminderDate);
                          reminderDate.setHours(23, 59, 59);
                          return reminderDate < new Date();
                        }
                        const [hours, minutes] = reminder.reminderTime.split(":");
                        const reminderDateTime = new Date(reminder.reminderDate);
                        reminderDateTime.setHours(parseInt(hours), parseInt(minutes));
                        return reminderDateTime < new Date();
                      })();

                      return (
                        <motion.div
                          key={reminder._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border rounded-lg p-4 ${
                            isPastTime ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                                {isPastTime && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                                    Overdue
                                  </span>
                                )}
                              </div>
                              {reminder.description && (
                                <p className="text-sm text-gray-600 mb-3">{reminder.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>
                                    {formatDate(reminder.reminderDate)}
                                  </span>
                                </div>
                                {reminder.reminderTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>{reminder.reminderTime}</span>
                                  </div>
                                )}
                                {isAdmin && reminder.createdBy && (
                                  <div className="flex items-center gap-1">
                                    <User size={14} />
                                    <span className="font-medium text-blue-600">
                                      Created by: {reminder.createdBy.name}
                                      {/* {reminder.createdBy.designation && ` (${reminder.createdBy.designation})`} */}
                                    </span>
                                  </div>
                                )}
                                {reminder.lead && (
                                  <div className="text-gray-500">
                                    Lead: {reminder.lead.customerName || reminder.lead.ownerName}
                                  </div>
                                )}
                                {reminder.lead && (
                                  <div className="text-gray-500">
                                    Call: {reminder.lead.mobileNumber}
                                  </div>
                                )}
                               
                              </div>
                            </div>
                            {!isAdmin && (
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => handleComplete(reminder._id)}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                                  title="Mark as completed"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleCancelClick(reminder)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                  title="Cancel reminder"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

            
              {/* Completed Reminders */}
              {completedReminders.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Completed Reminders ({completedReminders.length})
                  </h2>
                  <div className="space-y-3">
                    {completedReminders.map((reminder) => (
                      <motion.div
                        key={reminder._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border rounded-lg p-4 bg-gray-50 border-gray-200 opacity-75"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-700 line-through">
                                {reminder.title}
                              </h3>
                              <CheckCircle size={16} className="text-green-600" />
                            </div>
                            {reminder.description && (
                              <p className="text-sm text-gray-500 line-through mb-2">
                                {reminder.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>
                                  {formatDate(reminder.reminderDate)}
                                </span>
                              </div>
                              {reminder.reminderTime && (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{reminder.reminderTime}</span>
                                </div>
                              )}
                              {isAdmin && reminder.createdBy && (
                                <div className="flex items-center gap-1">
                                  <User size={12} />
                                  <span className="font-medium text-blue-600">
                                    Created by: {reminder.createdBy.name}
                                    {/* {reminder.createdBy.designation && ` (${reminder.createdBy.designation})`} */}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* {!isAdmin && (
                            <button
                              onClick={() => handleDelete(reminder._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition ml-4"
                              title="Delete reminder"
                            >
                              <Trash2 size={18} />
                            </button>
                          )} */}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

                {/* Cancelled Reminders */}
                {cancelledReminders.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-orange-600 mb-4">
                    Cancelled Reminders ({cancelledReminders.length})
                  </h2>
                  <div className="space-y-3">
                    {cancelledReminders.map((reminder) => (
                      <motion.div
                        key={reminder._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border rounded-lg p-4 bg-orange-50 border-orange-200 opacity-80"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-700 line-through">
                                {reminder.title}
                              </h3>
                              <X size={16} className="text-orange-600" />
                            </div>
                            {reminder.description && (
                              <p className="text-sm text-gray-500 line-through mb-2">
                                {reminder.description}
                              </p>
                            )}
                            {reminder.cancellationReason && (
                              <p className="text-sm text-orange-700 font-medium mt-2">
                                Reason: {reminder.cancellationReason}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>
                                  {formatDate(reminder.reminderDate)}
                                </span>
                              </div>
                              {reminder.reminderTime && (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{reminder.reminderTime}</span>
                                </div>
                              )}
                              {isAdmin && reminder.createdBy && (
                                <div className="flex items-center gap-1">
                                  <User size={12} />
                                  <span className="font-medium text-blue-600">
                                    Created by: {reminder.createdBy.name}
                                  
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow-md border border-gray-200 p-4 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to{" "}
                {Math.min(currentPage * pageSize, total)} of {total} reminders
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-gray-600">
                  Items per page:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                title="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      </motion.div>

      {/* Add Reminder Modal */}
      {addModalOpen && (
        <AddReminderModal 
          open={addModalOpen} 
          onClose={() => setAddModalOpen(false)} 
        />
      )}

      {/* Cancel Reminder Modal */}
      {cancelModalOpen && reminderToCancel && (
        <CancelReminderModal
          open={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false);
            setReminderToCancel(null);
          }}
          reminder={reminderToCancel}
        />
      )}
    </div>
  );
}
