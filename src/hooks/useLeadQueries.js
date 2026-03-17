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

// Fetch urgency counts for timeline chips (tenant-only).
// Uses same backend response fields: countCritical/countOverdue/countHigh.
// This is separate from the main leads list so counts can exclude owner leads
// without forcing the whole table to tenant.
export const useTenantTimelineCountsAllLeads = (filters = {}) => {
  const {
    createdBy,
    assignedTo,
    startDate,
    endDate,
    status,
    source,
    subPropertyType,
    city,
    isRegistered,
  } = filters;

  return useQuery({
    queryKey: [
      'leads',
      'tenant-timeline-counts',
      createdBy,
      assignedTo,
      startDate,
      endDate,
      status,
      source,
      subPropertyType,
      city,
      isRegistered,
    ],
    queryFn: async () => {
      // Minimal query: we only need counts.
      const params = { page: 1, limit: 1, customerType: 'tenant' };
      if (createdBy) params.createdBy = createdBy;
      if (assignedTo) params.assignedTo = assignedTo;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status) params.status = status;
      if (source && source.trim()) params.source = source.trim();
      if (subPropertyType && subPropertyType.trim()) params.subPropertyType = subPropertyType.trim();
      if (city && city.trim()) params.city = city.trim();
      if (isRegistered === 'true' || isRegistered === 'false') params.isRegistered = isRegistered;

      const response = await axios.get('/leads/all', { params });
      const data = response.data || {};
      return {
        countCritical: data.countCritical ?? 0,
        countOverdue: data.countOverdue ?? 0,
        countHigh: data.countHigh ?? 0,
      };
    },
    staleTime: 30_000,
  });
};

// Tenant-only totals for a specific urgency level (so chip counts match the list when clicked).
export const useTenantUrgencyTotalAllLeads = (urgencyFilter = '', filters = {}) => {
  const {
    createdBy,
    assignedTo,
    startDate,
    endDate,
    status,
    source,
    subPropertyType,
    city,
    isRegistered,
  } = filters;

  return useQuery({
    queryKey: [
      'leads',
      'tenant-urgency-total',
      urgencyFilter || 'all',
      createdBy,
      assignedTo,
      startDate,
      endDate,
      status,
      source,
      subPropertyType,
      city,
      isRegistered,
    ],
    queryFn: async () => {
      const params = { page: 1, limit: 1, customerType: 'tenant' };
      if (urgencyFilter) params.urgencyFilter = urgencyFilter;
      if (createdBy) params.createdBy = createdBy;
      if (assignedTo) params.assignedTo = assignedTo;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status) params.status = status;
      if (source && source.trim()) params.source = source.trim();
      if (subPropertyType && subPropertyType.trim()) params.subPropertyType = subPropertyType.trim();
      if (city && city.trim()) params.city = city.trim();
      if (isRegistered === 'true' || isRegistered === 'false') params.isRegistered = isRegistered;
      const response = await axios.get('/leads/all', { params });
      const data = response.data || {};
      return data.total ?? 0;
    },
    staleTime: 30_000,
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

// Tenant-only urgency counts for My Leads timeline chips.
export const useTenantTimelineCountsMyLeads = (filters = {}) => {
  const { status, source, subPropertyType, city, isRegistered } = filters;
  return useQuery({
    queryKey: ['leads', 'my', 'tenant-timeline-counts', status, source, subPropertyType, city, isRegistered],
    queryFn: async () => {
      const params = { page: 1, limit: 1, customerType: 'tenant' };
      if (status) params.status = status;
      if (source && source.trim()) params.source = source.trim();
      if (subPropertyType && subPropertyType.trim()) params.subPropertyType = subPropertyType.trim();
      if (city && city.trim()) params.city = city.trim();
      if (isRegistered === 'true' || isRegistered === 'false') params.isRegistered = isRegistered;
      const response = await axios.get('/leads/my', { params });
      const data = response.data || {};
      return {
        countCritical: data.countCritical ?? 0,
        countOverdue: data.countOverdue ?? 0,
        countHigh: data.countHigh ?? 0,
      };
    },
    staleTime: 30_000,
  });
};

export const useTenantUrgencyTotalMyLeads = (urgencyFilter = '', filters = {}) => {
  const { status, source, subPropertyType, city, isRegistered } = filters;
  return useQuery({
    queryKey: ['leads', 'my', 'tenant-urgency-total', urgencyFilter || 'all', status, source, subPropertyType, city, isRegistered],
    queryFn: async () => {
      const params = { page: 1, limit: 1, customerType: 'tenant' };
      if (urgencyFilter) params.urgencyFilter = urgencyFilter;
      if (status) params.status = status;
      if (source && source.trim()) params.source = source.trim();
      if (subPropertyType && subPropertyType.trim()) params.subPropertyType = subPropertyType.trim();
      if (city && city.trim()) params.city = city.trim();
      if (isRegistered === 'true' || isRegistered === 'false') params.isRegistered = isRegistered;
      const response = await axios.get('/leads/my', { params });
      const data = response.data || {};
      return data.total ?? 0;
    },
    staleTime: 30_000,
  });
};
// Update lead status
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await axios.put(`/leads/${id}/status`, { status });
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

// Mark lead as deal closed (optionally with payment screenshot)
export const useMarkDealClosed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // payload: { id, paymentScreenshotFile? }
    mutationFn: async ({ id, paymentScreenshotFile }) => {
      const formData = new FormData();
      if (paymentScreenshotFile) {
        formData.append("paymentScreenshot", paymentScreenshotFile);
      }
      const response = await axios.put(
        `/leads/${id}/mark-deal-closed`,
        formData
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all lead queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
      // Deal-closed affects customer stats - refresh customers
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

// Meta-Ad: enable/disable or record mark (for registered leads only)
export const useUpdateLeadMetaAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, metaAdEnabled, mark }) => {
      const body = {};
      if (metaAdEnabled !== undefined) body.metaAdEnabled = metaAdEnabled;
      if (mark === true) body.mark = true;
      const response = await axios.put(`/leads/${id}/meta-ad`, body);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
};

// Add an employee remark (append; supports multiple remarks per lead)
export const useAddEmployeeRemark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, remark }) => {
      const response = await axios.post(`/leads/${id}/remarks`, { remark: remark.trim() });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
};

// Internal remarks (customer care): from employeeRemarks — display with date and name
export const getRemarksList = (lead) => {
  if (!lead) return [];
  const r = lead.employeeRemarks;
  if (Array.isArray(r)) return r;
  if (typeof r === 'string' && r.trim()) return [{ text: r.trim(), addedBy: null, addedAt: null }];
  return [];
};

// Customer remarks (employees): from customerRemarksByEmployee — display with name and time
export const getCustomerRemarksList = (lead) => {
  if (!lead) return [];
  const r = lead.customerRemarksByEmployee;
  if (Array.isArray(r)) return r;
  return [];
};

export const hasRemarks = (lead) =>
  getRemarksList(lead).length > 0 || getCustomerRemarksList(lead).length > 0;

// True only when lead has internal remarks (customer care) — used for purple line & chatbox indicator
export const hasInternalRemarks = (lead) => getRemarksList(lead).length > 0;