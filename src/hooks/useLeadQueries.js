import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../lib/axios.js'

// Fetch leads (admin: all, employee: depending on backend rules)
export const useFetchLeads = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['leads', page, limit],
    queryFn: async () => {
      const response = await axios.get('/leads/all',{
        params: { page, limit },
      })
      const data = response.data;
      // const leads = data.data || []
      // const total = data.count ?? leads.length

      // Slice manually
      // const start = (page - 1) * limit
      // const end = start + limit
      // const paginatedLeads = leads.slice(start, end)

      return {
        leads: data.data || [],
        total: data.total || 0,
        page: data.page || page,
        limit:  data.limit || limit,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / limit),
      }
    },
  })
}

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
    },
  })
}

// Fetch current user's leads (employee view)
export const useMyLeads = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['leads', 'my', page, limit],
    queryFn: async () => {
      const response = await axios.get('/leads/my', {
        params: { page, limit },
      });
      const data = response.data;
      // const leads = data.data || [];
      // const total = data.count ?? (Array.isArray(leads) ? leads.length : 0);

           // Slice manually
      // const start = (page - 1) * limit
      // const end = start + limit
      // const paginatedLeads = leads.slice(start, end)


     return {
        leads: data.data || [],
        total: data.total || 0,
        page: data.page || page,
        limit:  data.limit || limit,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / limit),
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
    },
  });
};