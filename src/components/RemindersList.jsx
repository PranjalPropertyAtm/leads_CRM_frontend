import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Calendar, Clock, CheckCircle, Trash2, Edit, X, User } from "lucide-react";
import { useRemindersByDate, useMarkReminderCompleted, useDeleteReminder } from "../hooks/useReminderQueries";
import { useLoadUser } from "../hooks/useAuthQueries";
import { notify } from "../utils/toast";
import { formatDate, formatDateLong, formatTime24To12 } from "../utils/dateFormat";
import AddReminderModal from "./AddReminderModal";
import CancelReminderModal from "./CancelReminderModal";

export default function RemindersList({ date, showAddButton = true }) {
  const { data: user } = useLoadUser();
  const isAdmin = user?.role !== "employee";
  const { data: reminders = [], isLoading } = useRemindersByDate(date);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reminderToCancel, setReminderToCancel] = useState(null);

  const markCompletedMutation = useMarkReminderCompleted();
  const deleteMutation = useDeleteReminder();

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

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const targetDate = new Date(dateString);
    return (
      today.getDate() === targetDate.getDate() &&
      today.getMonth() === targetDate.getMonth() &&
      today.getFullYear() === targetDate.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md border p-4">
        <p className="text-gray-500">Loading reminders...</p>
      </div>
    );
  }

  const incompleteReminders = reminders.filter((r) => !r.isCompleted && !r.isCancelled);
  const completedReminders = reminders.filter((r) => r.isCompleted);
  const cancelledReminders = reminders.filter((r) => r.isCancelled);

  const handleCancelClick = (reminder) => {
    setReminderToCancel(reminder);
    setCancelModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">
              {isToday(date) ? "Today's Reminders" : `Reminders for ${formatDateLong(date)}`}
            </h3>
            {incompleteReminders.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                {incompleteReminders.length}
              </span>
            )}
          </div>
          {showAddButton && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Bell size={14} />
              Add Reminder
            </button>
          )}
        </div>

        {reminders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No reminders for this date.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Incomplete Reminders */}
            {incompleteReminders.length > 0 && (
              <div className="space-y-2">
                {incompleteReminders.map((reminder) => {
                  const isPastTime = (() => {
                    if (!reminder.reminderTime) return false;
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
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{reminder.title}</h4>
                            {isPastTime && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                                Overdue
                              </span>
                            )}
                          </div>
                          {reminder.description && (
                            <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>
                                {formatDate(reminder.reminderDate)}
                              </span>
                            </div>
                            {reminder.reminderTime && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{formatTime24To12(reminder.reminderTime)}</span>
                              </div>
                            )}
                            {isAdmin && reminder.createdBy && (
                              <div className="flex items-center gap-1">
                                <User size={12} />
                                <span className="font-medium text-blue-600">
                                  Created by: {reminder.createdBy.name}
                                  {reminder.createdBy.designation && ` (${reminder.createdBy.designation})`}
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
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition"
                              title="Mark as completed"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleCancelClick(reminder)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition"
                              title="Cancel reminder"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

          
            {/* Completed Reminders */}
            {completedReminders.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Completed ({completedReminders.length})
                </h4>
                <div className="space-y-2">
                  {completedReminders.map((reminder) => (
                    <motion.div
                      key={reminder._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border rounded-lg p-3 bg-gray-50 border-gray-200 opacity-60"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-700 line-through">
                              {reminder.title}
                            </h4>
                            <CheckCircle size={14} className="text-green-600" />
                          </div>
                          {reminder.description && (
                            <p className="text-xs text-gray-500 mt-1 line-through">
                              {reminder.description}
                            </p>
                          )}
                             <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>
                                {formatDate(reminder.reminderDate)}
                              </span>
                            </div>
                            {reminder.reminderTime && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{formatTime24To12(reminder.reminderTime)}</span>
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
                        {/* {!isAdmin && (
                          <button
                            onClick={() => handleDelete(reminder._id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition ml-2"
                            title="Delete reminder"
                          >
                            <Trash2 size={14} />
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
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-orange-600 mb-2">
                  Cancelled ({cancelledReminders.length})
                </h4>
                <div className="space-y-2">
                  {cancelledReminders.map((reminder) => (
                    <motion.div
                      key={reminder._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border rounded-lg p-3 bg-orange-50 border-orange-200 opacity-80"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-700 line-through">
                              {reminder.title}
                            </h4>
                            <X size={14} className="text-orange-600" />
                          </div>
                          {reminder.description && (
                            <p className="text-xs text-gray-500 mt-1 line-through">
                              {reminder.description}
                            </p>
                          )}
                          {reminder.cancellationReason && (
                            <p className="text-xs text-orange-700 mt-2 font-medium">
                              Reason: {reminder.cancellationReason}
                            </p>
                          )}

                          
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

      {addModalOpen && (
        <AddReminderModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
        />
      )}

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
    </>
  );
}
