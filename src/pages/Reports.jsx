import React, { useMemo, useState } from "react";
import { useLeadsOverviewReport, useLeadConversionReport, useVisitsSummaryReport } from "../hooks/useReportQueries";
import { Download, BarChart3, Users, MapPin, ClipboardList, Calendar, CheckCircle, TrendingUp } from "lucide-react";
import { notify } from "../utils/toast";

const today = new Date().toISOString().slice(0, 10);

export default function Reports() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    source: "",
    city: "",
    propertyType: "",
    customerType: "",
    status: "",
  });

  const overviewQuery = useLeadsOverviewReport(filters);
  const conversionQuery = useLeadConversionReport(filters);
  const visitsQuery = useVisitsSummaryReport({ startDate: filters.startDate, endDate: filters.endDate });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const exportCsv = (rows, filename) => {
    if (!rows || rows.length === 0) return notify.error("No data to export");
    const header = Object.keys(rows[0]);
    const csv = [
      header.join(","),
      ...rows.map((r) => header.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const overview = overviewQuery.data || {};
  const conversion = conversionQuery.data || {};
  const visits = visitsQuery.data || [];

  const conversionRows = useMemo(() => {
    return (conversion.byEmployee || []).map((row) => ({
      employeeId: row.employeeId || row._id || "",
      employeeName: row.employeeName || "N/A",
      total: row.total || 0,
      registered: row.registered || 0,
      dealClosed: row.dealClosed || 0,
      registrationRate: row.total ? `${((row.registered / row.total) * 100).toFixed(2)}%` : "0%",
      dealClosedRate: row.total ? `${((row.dealClosed / row.total) * 100).toFixed(2)}%` : "0%",
    }));
  }, [conversion]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Reports</h1>
            <p className="text-sm text-gray-600 font-medium">Insights across leads and visits</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportCsv(conversionRows, "lead-conversion.csv")}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-2 hover:bg-blue-700"
            >
              <Download size={16} /> Export Conversion
            </button>
            <button
              onClick={() => {
                const statusRows = (overview.byStatus || []).map((row) => ({
                  status: row._id || "N/A",
                  count: row.count || 0,
                }));
                exportCsv(statusRows, "leads-by-status.csv");
              }}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm flex items-center gap-2 hover:bg-emerald-700"
            >
              <Download size={16} /> Export Status
            </button>
            <button
              onClick={() => exportCsv(visits, "visits-summary.csv")}
              className="px-3 py-2 rounded-lg bg-slate-200 text-gray-800 text-sm flex items-center gap-2 hover:bg-slate-300"
            >
              <Download size={16} /> Export Visits
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <FilterField label="Start Date" name="startDate" value={filters.startDate} onChange={handleChange} type="date" max={filters.endDate || today} />
          <FilterField label="End Date" name="endDate" value={filters.endDate} onChange={handleChange} type="date" min={filters.startDate} max={today} />
          <FilterField label="Source" name="source" value={filters.source} onChange={handleChange} placeholder="e.g. Referal" />
          <FilterField label="City" name="city" value={filters.city} onChange={handleChange} placeholder="e.g. Mumbai" />
          <FilterField label="Property Type" name="propertyType" value={filters.propertyType} onChange={handleChange} placeholder="e.g. Apartment" />
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Customer Type</label>
            <select
              name="customerType"
              value={filters.customerType}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All</option>
              <option value="tenant">Tenant</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="registered">Registered</option>
              <option value="visit_scheduled">Visit Scheduled</option>
              <option value="visit_completed">Visit Completed</option>
              <option value="deal_closed">Deal Closed</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<BarChart3 className="text-blue-600" size={24} />}
            title="Total Leads"
            value={overview.total ?? 0}
            loading={overviewQuery.isLoading}
          />
          <KpiCard
            icon={<ClipboardList className="text-green-600" size={24} />}
            title="Registered Leads"
            value={conversion.registered ?? 0}
            loading={conversionQuery.isLoading}
          />
          <KpiCard
            icon={<CheckCircle className="text-emerald-600" size={24} />}
            title="Deals Closed"
            value={overview.dealClosed ?? 0}
            loading={overviewQuery.isLoading}
          />
          <KpiCard
            icon={<TrendingUp className="text-purple-600" size={24} />}
            title="Deal Closed Rate"
            value={`${overview.dealClosedRate ?? 0}%`}
            loading={overviewQuery.isLoading}
          />
        </div>

        {/* Lead Breakdown */}
        <Section title="Lead Breakdown">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BreakdownTable title="By Source" rows={overview.bySource} loading={overviewQuery.isLoading} />
            <BreakdownTable title="By City" rows={overview.byCity} loading={overviewQuery.isLoading} />
            <BreakdownTable title="By Customer Type" rows={overview.byCustomerType} loading={overviewQuery.isLoading} />
            <BreakdownTable title="By Property Type" rows={overview.byPropertyType} loading={overviewQuery.isLoading} />
            <BreakdownTable 
              title="By Status" 
              rows={overview.byStatus} 
              loading={overviewQuery.isLoading}
              formatStatus={true}
            />
          </div>
        </Section>

        {/* Lead Conversion by Employee */}
        <Section title="Lead Conversion by Employee">
          <SimpleTable
            headers={["Employee Name", "Total", "Registered", "Reg. Rate", "Deals Closed", "Close Rate"]}
            rows={conversionRows}
            loading={conversionQuery.isLoading}
            renderRow={(row) => (
              <>
                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{row.employeeName || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.total}</td>
                <td className="px-6 py-4 text-sm text-green-700 font-semibold">{row.registered}</td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.registrationRate}</td>
                <td className="px-6 py-4 text-sm text-emerald-700 font-semibold">{row.dealClosed}</td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.dealClosedRate}</td>
              </>
            )}
          />
        </Section>

        {/* Visits Summary */}
        <Section title="Visits Summary">
          <SimpleTable
            headers={["Employee", "Email", "Visits"]}
            rows={visits || []}
            loading={visitsQuery.isLoading}
            renderRow={(row, idx) => (
              <>
                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{row.employeeName || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{row.employeeEmail || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-purple-700 font-semibold">{row.totalVisits || 0}</td>
              </>
            )}
          />
        </Section>
      </div>
    </div>
  );
}

function KpiCard({ icon, title, value, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg flex items-center gap-4 hover:shadow-xl transition-shadow">
      <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{loading ? "..." : value}</p>
      </div>
    </div>
  );
}

function BreakdownTable({ title, rows = [], loading, formatStatus = false }) {
  const formatStatusLabel = (status) => {
    if (!formatStatus) return status;
    const statusMap = {
      new: "New",
      contacted: "Contacted",
      registered: "Registered",
      visit_scheduled: "Visit Scheduled",
      visit_completed: "Visit Completed",
      deal_closed: "Deal Closed",
      lost: "Lost",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    if (!formatStatus) return "text-gray-800";
    const colorMap = {
      new: "text-gray-600",
      contacted: "text-orange-600",
      registered: "text-indigo-600",
      visit_scheduled: "text-purple-600",
      visit_completed: "text-blue-600",
      deal_closed: "text-green-600",
      lost: "text-red-600",
    };
    return colorMap[status] || "text-gray-800";
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 flex items-center gap-2">
        <MapPin size={18} className="text-gray-600" />
        <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</p>
      </div>
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-500 font-medium">Loading...</p>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-500 font-medium text-center">No data available</p>
        ) : (
          rows.map((row, idx) => (
            <div key={idx} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <span className={`text-sm font-medium ${getStatusColor(row._id)}`}>{formatStatusLabel(row._id) || "N/A"}</span>
              <span className="font-bold text-gray-900 text-sm">{row.count ?? 0}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SimpleTable({ headers, rows, loading, renderRow }) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
            {headers.map((h) => (
              <th key={h} className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-gray-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-500 font-medium">Loading...</p>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-gray-500 font-medium">
                No data available
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                {renderRow(row, idx)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FilterField({ label, name, value, onChange, type = "text", ...rest }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                   placeholder:text-gray-400"
        {...rest}
      />
    </div>
  );
}


