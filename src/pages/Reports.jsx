import React, { useMemo, useState } from "react";
import { useLeadsOverviewReport, useLeadConversionReport, useVisitsSummaryReport } from "../hooks/useReportQueries";
import { Download, BarChart3, Users, MapPin, ClipboardList, Calendar } from "lucide-react";
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
      rate: row.total ? `${((row.registered / row.total) * 100).toFixed(2)}%` : "0%",
    }));
  }, [conversion]);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500">Insights across leads and visits</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportCsv(conversionRows, "lead-conversion.csv")}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-2 hover:bg-blue-700"
            >
              <Download size={16} /> Export Conversion
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
        <div className="bg-white rounded-xl shadow-sm border p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            icon={<Users className="text-purple-600" size={24} />}
            title="Registration Rate"
            value={`${conversion.registrationRate ?? 0}%`}
            loading={conversionQuery.isLoading}
          />
        </div>

        {/* Lead Breakdown */}
        <Section title="Lead Breakdown">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BreakdownTable title="By Source" rows={overview.bySource} loading={overviewQuery.isLoading} />
            <BreakdownTable title="By City" rows={overview.byCity} loading={overviewQuery.isLoading} />
            <BreakdownTable title="By Customer Type" rows={overview.byCustomerType} loading={overviewQuery.isLoading} />
            <BreakdownTable title="By Property Type" rows={overview.byPropertyType} loading={overviewQuery.isLoading} />
          </div>
        </Section>

        {/* Lead Conversion by Employee */}
        <Section title="Lead Conversion by Employee">
          <SimpleTable
            headers={["Employee Name", "Total", "Registered", "Rate"]}
            rows={conversionRows}
            loading={conversionQuery.isLoading}
            renderRow={(row) => (
              <tr key={row.employeeId}>
                <td className="px-4 py-2 text-sm text-gray-800">{row.employeeName || "N/A"}</td>
                <td className="px-4 py-2 text-sm">{row.total}</td>
                <td className="px-4 py-2 text-sm text-green-700">{row.registered}</td>
                <td className="px-4 py-2 text-sm">{row.rate}</td>
              </tr>
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
              <tr key={idx}>
                <td className="px-4 py-2 text-sm text-gray-800">{row.employeeName || "N/A"}</td>
                <td className="px-4 py-2 text-sm">{row.employeeEmail || "N/A"}</td>
                <td className="px-4 py-2 text-sm text-purple-700">{row.totalVisits || 0}</td>
              </tr>
            )}
          />
        </Section>
      </div>
    </div>
  );
}

function KpiCard({ icon, title, value, loading }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3">
      <div className="p-3 bg-slate-100 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{loading ? "..." : value}</p>
      </div>
    </div>
  );
}

function BreakdownTable({ title, rows = [], loading }) {
  return (
    <div className="border rounded-xl bg-white shadow-sm">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <MapPin size={16} className="text-gray-500" />
        <p className="text-sm font-semibold text-gray-800">{title}</p>
      </div>
      <div className="divide-y">
        {loading ? (
          <p className="px-4 py-3 text-sm text-gray-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-3 text-sm text-gray-500">No data</p>
        ) : (
          rows.map((row, idx) => (
            <div key={idx} className="px-4 py-3 flex justify-between text-sm">
              <span className="text-gray-800">{row._id || "N/A"}</span>
              <span className="font-semibold text-gray-900">{row.count ?? 0}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SimpleTable({ headers, rows, loading, renderRow }) {
  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-gray-600 uppercase text-xs">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-4 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-4 text-center text-gray-500">
                No data
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => renderRow(row, idx))
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
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        className="border rounded-lg px-3 py-2"
        {...rest}
      />
    </div>
  );
}


