import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../lib/axios.js'

// Fetch leads (admin: all, employee: depending on backend rules)
// filters: { createdBy, assignedTo, startDate, endDate, status, customerType, source, subPropertyType, city, isRegistered }
export const useFetchLeads = (page = 1, limit = 10, urgencyFilter = '', filters = {}) => {
  const {
    createdBy,
    assignedTo,
    startDate,
    endDate,
    status,
    customerType,
    source,
    subPropertyType,
    city,
    isRegistered,
  } = filters;

  return useQuery({
    queryKey: [
      'leads',
      page,
      limit,
      urgencyFilter || 'all',
      createdBy,
      assignedTo,
      startDate,
      endDate,
      status,
      customerType,
      source,
      subPropertyType,
      city,
      isRegistered,
    ],
    queryFn: async () => {
      const params = { page, limit };
      if (urgencyFilter) params.urgencyFilter = urgencyFilter;
      if (createdBy) params.createdBy = createdBy;
      if (assignedTo) params.assignedTo = assignedTo;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status) params.status = status;
      if (customerType) params.customerType = customerType;
      if (source && source.trim()) params.source = source.trim();
      if (subPropertyType && subPropertyType.trim()) params.subPropertyType = subPropertyType.trim();
      if (city && city.trim()) params.city = city.trim();
      if (isRegistered === 'true' || isRegistered === 'false') params.isRegistered = isRegistered;
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

// Fetch distinct source, subPropertyType, city for lead filters (from backend)
export const useLeadFilterOptions = () => {
  return useQuery({
    queryKey: ['leads', 'filter-options'],
    queryFn: async () => {
      const response = await axios.get('/leads/filter-options');
      const data = response.data?.data || {};
      return {
        source: Array.isArray(data.source) ? data.source : [],
        subPropertyType: Array.isArray(data.subPropertyType) ? data.subPropertyType : [],
        city: Array.isArray(data.city) ? data.city : [],
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
      // Refresh filter options (source, subPropertyType, city)
      queryClient.invalidateQueries({ queryKey: ['leads', 'filter-options'] })
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
      queryClient.invalidateQueries({ queryKey: ['leads', 'filter-options'] })

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
// filters: { urgencyFilter, status, customerType, source, subPropertyType, city, isRegistered }
export const useMyLeads = (page = 1, limit = 10, urgencyFilter = '', filters = {}) => {
  const { status, customerType, source, subPropertyType, city, isRegistered } = filters;
  return useQuery({
    queryKey: ['leads', 'my', page, limit, urgencyFilter || 'all', status, customerType, source, subPropertyType, city, isRegistered],
    queryFn: async () => {
      const params = { page, limit };
      if (urgencyFilter) params.urgencyFilter = urgencyFilter;
      if (status) params.status = status;
      if (customerType) params.customerType = customerType;
      if (source && source.trim()) params.source = source.trim();
      if (subPropertyType && subPropertyType.trim()) params.subPropertyType = subPropertyType.trim();
      if (city && city.trim()) params.city = city.trim();
      if (isRegistered === 'true' || isRegistered === 'false') params.isRegistered = isRegistered;
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