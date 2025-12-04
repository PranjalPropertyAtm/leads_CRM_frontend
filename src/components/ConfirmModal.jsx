import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function ConfirmModal({
  isOpen = false,
  title = "Confirm",
  description = "",
  onCancel = () => {},
  onConfirm = () => {},
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
  loading = false,
  destructive = false,
}) {
  // close on Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>

          <button
            onClick={onCancel}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            disabled={loading}
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white transition ${
              destructive ? (loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700")
                         : (loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")
            }`}
          >
            {loading ? (destructive ? "Deleting..." : "Working...") : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
