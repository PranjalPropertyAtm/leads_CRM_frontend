import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../lib/axios.js'

// Fetch leads (admin: all, employee: depending on backend rules)
export const useFetchLeads = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['leads', page, limit],
    queryFn: async () => {
      const response = await axios.get('/leads/all', {
        params: {
          page,
          limit,
        },
      })

      // Backend currently returns { success, count, data }
      const data = response.data || {}
      const leads = data.data || []
      const total = data.count ?? (Array.isArray(leads) ? leads.length : 0)

      return {
        leads,
        total,
        page: data.page || page,
        limit: data.limit || limit,
        totalPages: data.totalPages ?? (limit ? Math.ceil(total / limit) : 1),
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
    onSuccess: (data) => {
      // Invalidate leads so updated data refreshes
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['leads', 'my'] })
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
export const useMyLeads = () => {
  return useQuery({
    queryKey: ['leads', 'my'],
    queryFn: async () => {
      const response = await axios.get('/leads/my')
      const data = response.data || {}
      return {
        leads: data.data || [],
        total: data.count ?? (Array.isArray(data.data) ? data.data.length : 0),
      }
    },
  })
}
