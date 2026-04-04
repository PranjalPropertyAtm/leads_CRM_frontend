import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";

export const useAddVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post("/visits/add", payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["visits"]);
      queryClient.invalidateQueries(["leadVisits"]);
      queryClient.invalidateQueries(["leads"]);
      if (data?.visitReminderCreated) {
        queryClient.invalidateQueries(["reminders"]);
      }
    },
  });
};

export const useUpdateVisitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, payload }) => {
      const res = await axios.patch(`/visits/${visitId}/feedback`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["visits"]);
      queryClient.invalidateQueries(["leadVisits"]);
      queryClient.invalidateQueries(["leads"]);
    },
  });
};

export const useCancelVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, cancellationReason }) => {
      const res = await axios.patch(`/visits/${visitId}/cancel`, {
        cancellationReason: cancellationReason || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["visits"]);
      queryClient.invalidateQueries(["leadVisits"]);
      queryClient.invalidateQueries(["leads"]);
    },
  });
};

export const useMyVisits = (page = 1, limit = 10, filters = {}) => {
  const { startDate, endDate, status, customerType } = filters;
  return useQuery({
    queryKey: ["visits", "my", page, limit, startDate, endDate, status, customerType],
    queryFn: async () => {
      const params = { page, limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status && status !== "all") params.status = status;
      if (customerType && customerType !== "all") params.customerType = customerType;

      const res = await axios.get("/visits/my", { params });
      return {
        visits: res.data.data || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        limit: res.data.limit || limit,
        totalPages: res.data.totalPages || Math.ceil((res.data.total || 0) / limit),
      };
    },
  });
};

export const useAllVisits = (page = 1, limit = 10, filters = {}) => {
  const { startDate, endDate, status, customerType, visitedBy } = filters;
  return useQuery({
    queryKey: ["visits", "all", page, limit, startDate, endDate, status, customerType, visitedBy],
    queryFn: async () => {
      const params = { page, limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status && status !== "all") params.status = status;
      if (customerType && customerType !== "all") params.customerType = customerType;
      if (visitedBy) params.visitedBy = visitedBy;

      const res = await axios.get("/visits/all", { params });
      return {
        visits: res.data.data || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        limit: res.data.limit || limit,
        totalPages: res.data.totalPages || Math.ceil((res.data.total || 0) / limit),
      };
    },
  });
};

export const useLeadVisits = (leadId) => {
  return useQuery({
    queryKey: ["leadVisits", leadId],
    queryFn: async () => {
      const res = await axios.get(`/visits/lead/${leadId}`);
      return res.data.data;
    },
    enabled: !!leadId,
  });
};
