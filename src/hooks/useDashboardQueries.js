import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios.js";

// Dashboard stats query with aggressive caching for performance
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const response = await axios.get("/reports/dashboard");
      const data = response.data?.data ?? response.data ?? {};
      return {
        ...data,
        urgentLeads: Array.isArray(data.urgentLeads) ? data.urgentLeads : [],
        overdueLeads: Array.isArray(data.overdueLeads) ? data.overdueLeads : [],
      };
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
  });
};

