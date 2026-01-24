import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "../utils/toast";
import { useCancelReminder } from "../hooks/useReminderQueries";

export default function CancelReminderModal({ open, onClose, reminder }) {
  const [reason, setReason] = useState("");
  const cancelReminderMutation = useCancelReminder();

  if (!open) return null;

  const handleSubmit = () => {
    if (cancelReminderMutation.isPending) return;

    if (!reason.trim()) {
      return notify.error("Please provide a reason for cancelling this reminder");
    }

    cancelReminderMutation.mutate(
      {
        reminderId: reminder._id,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          notify.success("Reminder cancelled successfully");
          setReason("");
          onClose();
        },
        onError: (err) => {
          notify.error(err?.response?.data?.message || "Failed to cancel reminder");
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-orange-500" size={20} />
                <h2 className="text-xl font-bold text-gray-900">Cancel Reminder</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Reminder:</span> {reminder?.title}
              </p>
              {reminder?.description && (
                <p className="text-xs text-gray-500">{reminder.description}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for not completing this reminder..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={cancelReminderMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={cancelReminderMutation.isPending || !reason.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelReminderMutation.isPending ? "Cancelling..." : "Cancel Reminder"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
