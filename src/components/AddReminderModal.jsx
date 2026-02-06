import React, { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { notify } from "../utils/toast";
import { useCreateReminder } from "../hooks/useReminderQueries";
import { time12To24 } from "../utils/dateFormat";

export default function AddReminderModal({ open, onClose, lead = null }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [timeHour, setTimeHour] = useState("");
  const [timeMinute, setTimeMinute] = useState("0");
  const [timePeriod, setTimePeriod] = useState("AM");

  const createReminderMutation = useCreateReminder();

  if (!open) return null;

  const handleSubmit = () => {
    if (createReminderMutation.isPending) return;

    if (!title.trim()) {
      return notify.error("Please enter a reminder title");
    }

    if (!reminderDate) {
      return notify.error("Please select a reminder date");
    }

    const reminderTime24 = timeHour ? time12To24(timeHour, timeMinute, timePeriod) : null;

    createReminderMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        reminderDate,
        reminderTime: reminderTime24,
        leadId: lead?._id || null,
      },
      {
        onSuccess: () => {
          notify.success("Reminder created successfully");
          onClose();
          // Reset form
          setTitle("");
          setDescription("");
          setReminderDate("");
          setTimeHour("");
          setTimeMinute("0");
          setTimePeriod("AM");
        },
        onError: (err) => {
          notify.error(err?.response?.data?.message || "Failed to create reminder");
        },
      }
    );
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {lead ? `Add Reminder for ${lead.customerName || lead.ownerName}` : "Add Reminder"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter reminder title..."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter reminder description..."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Reminder Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline-block mr-1" />
              Reminder Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={today}
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Reminder Time (12-hour) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} className="inline-block mr-1" />
              Reminder Time (Optional)
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={timeHour}
                onChange={(e) => setTimeHour(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No time</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-gray-500 font-medium">:</span>
              <select
                value={timeMinute}
                onChange={(e) => setTimeMinute(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                ))}
              </select>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-20 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createReminderMutation.isPending}
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2
              ${
                createReminderMutation.isPending
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {createReminderMutation.isPending ? "Creating..." : "Create Reminder"}
          </button>
        </div>
      </div>
    </div>
  );
}
