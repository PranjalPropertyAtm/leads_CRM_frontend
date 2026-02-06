import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../lib/axios.js'

// Fetch leads (admin: all, employee: depending on backend rules)
export const useFetchLeads = (page = 1, limit = 10, urgencyFilter = '') => {
  return useQuery({
    queryKey: ['leads', page, limit, urgencyFilter || 'all'],
    queryFn: async () => {
      const params = { page, limit };
      if (urgencyFilter) params.urgencyFilter = urgencyFilter;
      const response = await axios.get('/leads/all', { params });
      const data = response.data;
      return {
        leads: data.data || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / limit),
        countCritical: data.countCritical ?? 0,
        countOverdue: data.countOverdue ?? 0,
        countHigh: data.countHigh ?? 0,
      };
    },
  });
};

// Create lead
export const useCreateLead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post('/leads/create', payload)
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate lead lists so new lead appears
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      // Also refresh customers because backend upserts customers on lead create
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

// Update lead
export const useUpdateLead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updateData }) => {
      const response = await axios.put(`/leads/update/${id}`, updateData)
      return response.data
    },
    // onSuccess: (data) => {
    //   // Invalidate leads so updated data refreshes
    //   queryClient.invalidateQueries({ queryKey: ['leads'] })
    //   queryClient.invalidateQueries({ queryKey: ['leads', 'my'] })

     onSuccess: (_, { id }) => {
      // Refresh lead list
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] })

      // Also refresh customers because lead update can change customer data
      queryClient.invalidateQueries({ queryKey: ['customers'] })

      // 🔥 MOST IMPORTANT – refresh single lead
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
    },
  })
}

// Delete lead
export const useDeleteLead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`/leads/delete/${id}`)
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate all lead queries so deleted lead disappears
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] })
      // Customer data may change after lead deletion (history/merge), refresh customers
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

// Fetch current user's leads (employee view)
export const useMyLeads = (page = 1, limit = 10, urgencyFilter = '') => {
  return useQuery({
    queryKey: ['leads', 'my', page, limit, urgencyFilter || 'all'],
    queryFn: async () => {
      const params = { page, limit };
      if (urgencyFilter) params.urgencyFilter = urgencyFilter;
      const response = await axios.get('/leads/my', { params });
      const data = response.data;
      return {
        leads: data.data || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / limit),
        countCritical: data.countCritical ?? 0,
        countOverdue: data.countOverdue ?? 0,
        countHigh: data.countHigh ?? 0,
      };
    },
  });
};

// Update lead status
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, customerRemark }) => {
      const payload = { status };
      if (typeof customerRemark !== 'undefined') payload.customerRemark = customerRemark;
      const response = await axios.put(`/leads/${id}/status`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate all lead queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
      // Status changes may affect customer counts - refresh customers
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

// Mark lead as deal closed
export const useMarkDealClosed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axios.put(`/leads/${id}/mark-deal-closed`);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate all lead queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
      // Deal-closed affects customer stats - refresh customers
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

// Update employee remarks (for customer care executives)
export const useUpdateEmployeeRemarks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, employeeRemarks, customerType }) => {
      const payload = {
        employeeRemarks: employeeRemarks || undefined,
      };
      // Include customerType if provided (required by validation schema)
      if (customerType) {
        payload.customerType = customerType;
      }
      const response = await axios.put(`/leads/update/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Refresh lead list and single lead
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
};