import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  CheckCircle,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  UserCircle2,
} from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboardQueries.js";
import { useLoadUser } from "../hooks/useAuthQueries.js";
import { useNavigate } from "react-router-dom";
import RemindersList from "../components/RemindersList.jsx";
import { formatDate } from "../utils/dateFormat.js";

// Memoized metric card component for performance
const MetricCard = React.memo(({ icon: Icon, title, value, subtitle, trend, color, delay = 0 }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate("/leads/all")}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value?.toLocaleString() || 0}</p>
          {subtitle && (
            <div className="flex items-center gap-2 text-sm">
              {trend && trend > 0 ? (
                <ArrowUpRight className="text-green-500" size={16} />
              ) : trend && trend < 0 ? (
                <ArrowDownRight className="text-red-500" size={16} />
              ) : null}
              <span className={trend && trend > 0 ? "text-green-600" : trend && trend < 0 ? "text-red-600" : "text-gray-500"}>
                {subtitle}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </motion.div>
  );
});

MetricCard.displayName = "MetricCard";

// Progress bar component
const ProgressBar = ({ label, value, max, color = "bg-blue-500" }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusColors = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    registered: "bg-purple-100 text-purple-700",
    visit_scheduled: "bg-indigo-100 text-indigo-700",
    visit_completed: "bg-cyan-100 text-cyan-700",
    deal_closed: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  };

  const displayStatus = status?.replace("_", " ") || "N/A";

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
      {displayStatus}
    </span>
  );
};

// Recent lead item component
const RecentLeadItem = React.memo(({ lead }) => {
  const navigate = useNavigate();
  const name = lead.customerName || lead.ownerName || "N/A";
  const date = formatDate(lead.createdAt);

  return (
    <div
      onClick={() => navigate(`/leads/all`)}
      className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer last:border-b-0"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900">{name}</p>
            <StatusBadge status={lead.status} />
          </div>
          <p className="text-xs text-gray-500 mb-1">
            Created by {lead.createdBy?.name || "Unknown"}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {lead.mobileNumber && (
              <span className="flex items-center gap-1">
                <Phone size={12} />
                {lead.mobileNumber}
              </span>
            )}
            {lead.city && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {lead.city}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {date}
            </span>
          </div>
        </div>
        <div className={`px-2 py-1 text-xs rounded-full font-medium ${
          lead.customerType === "tenant" 
            ? "bg-blue-100 text-blue-700" 
            : "bg-green-100 text-green-700"
        }`}>
          {lead.customerType}
        </div>
      </div>
    </div>
  );
});

RecentLeadItem.displayName = "RecentLeadItem";

export default function Dashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: user } = useLoadUser();

  // Memoize calculations for performance
  const metrics = useMemo(() => {
    if (!stats) return null;

    return {
      totalLeads: stats.leads?.total || 0,
      dealClosed: stats.leads?.dealClosed || 0,
      conversionRate: stats.leads?.conversionRate || 0,
      totalCustomers: stats.customers?.total || 0,
      // activeCustomers: stats.customers?.active || 0,
      totalVisits: stats.visits?.total || 0,
      recentVisits: stats.visits?.recent || 0,
      recentLeads: stats.recentLeads || [],
      statusBreakdown: stats.breakdowns?.status || [],
      customerTypeBreakdown: stats.breakdowns?.customerType || [],
      employeeBreakdown: stats.breakdowns?.employees || [],
    };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const maxStatusCount = metrics.statusBreakdown.length > 0
    ? Math.max(...metrics.statusBreakdown.map((s) => s.count))
    : 1;

  return (
    <div className="bg-slate-50 p-6 font-[Inter]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your leads.</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Users}
            title="Total Leads"
            value={metrics.totalLeads}
            subtitle={`${metrics.recentLeads.length} recent`}
            color="bg-blue-500"
            delay={0}
          />
          <MetricCard
            icon={CheckCircle}
            title="Deals Closed"
            value={metrics.dealClosed}
            subtitle={`${metrics.conversionRate}% conversion`}
            trend={metrics.conversionRate > 10 ? 1 : -1}
            color="bg-green-500"
            delay={0.1}
          />
          <MetricCard
            icon={Building2}
            title="Total Customers"
            value={metrics.totalCustomers}
            // subtitle={`${metrics.activeCustomers} active`}
            color="bg-purple-500"
            delay={0.2}
          />
          <MetricCard
            icon={Activity}
            title="Total Visits"
            value={metrics.totalVisits}
            subtitle={`${metrics.recentVisits} this week`}
            color="bg-orange-500"
            delay={0.3}
          />
        </div>

        {/* Today's Reminders - All users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-8"
        >
          <RemindersList date={new Date().toISOString().split("T")[0]} showAddButton={false} />
        </motion.div>

        {/* Charts and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-blue-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Lead Status Breakdown</h2>
            </div>
            {metrics.statusBreakdown.length > 0 ? (
              <div className="space-y-1">
                {metrics.statusBreakdown.map((item, idx) => (
                  <ProgressBar
                    key={item._id || idx}
                    label={item._id?.replace("_", " ") || "Unknown"}
                    value={item.count}
                    max={maxStatusCount}
                    color={
                      item._id === "deal_closed"
                        ? "bg-green-500"
                        : item._id === "lost"
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No status data available</p>
            )}
          </motion.div>

          {/* Customer Type Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Users className="text-purple-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Customer Types</h2>
            </div>
            {metrics.customerTypeBreakdown.length > 0 ? (
              <div className="space-y-4">
                {metrics.customerTypeBreakdown.map((item, idx) => {
                  const total = metrics.customerTypeBreakdown.reduce((sum, i) => sum + i.count, 0);
                  const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={item._id || idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {item._id || "Unknown"}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                          className={`h-full rounded-full ${
                            item._id === "tenant" ? "bg-blue-500" : "bg-green-500"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No customer type data</p>
            )}
          </motion.div>
        </div>

        {/* Employee lead breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <UserCircle2 className="text-amber-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Leads by Employee</h2>
          </div>
          {metrics.employeeBreakdown.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {metrics.employeeBreakdown.map((emp) => (
                <div key={emp.employeeId} className="flex items-center justify-between py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      {emp.employeeName || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500">{emp.employeeEmail || ""}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-gray-700">
                      <span className="font-semibold text-gray-900">{emp.total}</span> leads
                    </div>
                    <div className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-100">
                      {emp.dealClosed} closed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No employee lead data</p>
          )}
        </motion.div>

        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-indigo-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Recent Leads</h2>
            </div>
            <button
              onClick={() => window.location.href = "/leads/all"}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          {metrics.recentLeads.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {metrics.recentLeads.map((lead) => (
                <RecentLeadItem key={lead._id} lead={lead} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent leads</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
