import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";

// Create a reminder
export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post("/reminders/create", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
    }
  });
};

// Get reminders for a specific date
export const useRemindersByDate = (date) => {
  return useQuery({
    queryKey: ["reminders", "date", date],
    queryFn: async () => {
      const res = await axios.get("/reminders/date", {
        params: { date }
      });
      return res.data.data || [];
    },
    enabled: !!date,
    refetchInterval: 60000, // Refetch every minute
  });
};

// Get all reminders (employees see their own, admin sees all)
export const useAllReminders = (page = 1, limit = 10, filters = {}) => {
  return useQuery({
    queryKey: ["reminders", "all", page, limit, filters],
    queryFn: async () => {
      const params = { page, limit, ...filters };
      const res = await axios.get("/reminders/all", { params });
      return {
        reminders: res.data.data || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        limit: res.data.limit || limit,
        totalPages: res.data.totalPages || Math.ceil((res.data.total || 0) / limit),
      };
    }
  });
};

// Mark reminder as completed
export const useMarkReminderCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId) => {
      const res = await axios.patch(`/reminders/${reminderId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
    }
  });
};

// Cancel reminder with reason
export const useCancelReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reminderId, reason }) => {
      const res = await axios.patch(`/reminders/${reminderId}/cancel`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
    }
  });
};

// Delete reminder
export const useDeleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId) => {
      const res = await axios.delete(`/reminders/${reminderId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
    }
  });
};

// Update reminder
export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reminderId, ...payload }) => {
      const res = await axios.put(`/reminders/${reminderId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
    }
  });
};
