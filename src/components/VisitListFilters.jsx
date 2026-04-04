import React from "react";
import { Calendar, FilterX } from "lucide-react";
import { formatDate } from "../utils/dateFormat";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "planned", label: "Planned" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const LEAD_TYPE_OPTIONS = [
  { value: "all", label: "All lead types" },
  { value: "owner", label: "Owner lead" },
  { value: "tenant", label: "Tenant lead" },
];

const selectClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm text-sm font-medium " +
  "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

/**
 * Shared filters for All Visits / My Visits (server-side via query params).
 */
export default function VisitListFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  status,
  onStatusChange,
  customerType,
  onCustomerTypeChange,
  visitedBy,
  onVisitedByChange,
  showVisitedByFilter = false,
  employeeOptions = [],
}) {
  const hasActive =
    Boolean(startDate) ||
    Boolean(endDate) ||
    (status && status !== "all") ||
    (customerType && customerType !== "all") ||
    (showVisitedByFilter && visitedBy);

  const handleReset = () => {
    onStartDateChange("");
    onEndDateChange("");
    onStatusChange("all");
    onCustomerTypeChange("all");
    if (showVisitedByFilter && onVisitedByChange) onVisitedByChange("");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          showVisitedByFilter ? "lg:grid-cols-5" : "lg:grid-cols-4"
        }`}
      >
        <div>
          <label className={labelClass}>Start date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>End date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate || undefined}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            value={status || "all"}
            onChange={(e) => onStatusChange(e.target.value)}
            className={selectClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Lead type</label>
          <select
            value={customerType || "all"}
            onChange={(e) => onCustomerTypeChange(e.target.value)}
            className={selectClass}
          >
            {LEAD_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {showVisitedByFilter && (
          <div>
            <label className={labelClass}>Visited by</label>
            <select
              value={visitedBy || ""}
              onChange={(e) => onVisitedByChange(e.target.value)}
              className={selectClass}
            >
              <option value="">All employees</option>
              {employeeOptions.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name || emp.email || emp._id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hasActive && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            <FilterX size={16} />
            Clear filters
          </button>
          {(startDate || endDate) && (
            <p className="text-sm text-gray-600">
              {startDate && (
                <span>
                  From:{" "}
                  <span className="font-semibold text-gray-900">{formatDate(startDate)}</span>
                </span>
              )}
              {endDate && (
                <span className={startDate ? " ml-4" : ""}>
                  To:{" "}
                  <span className="font-semibold text-gray-900">{formatDate(endDate)}</span>
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
