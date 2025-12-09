import { useQuery } from '@tanstack/react-query'
import axios from '../lib/axios'

const buildParams = (filters = {}) => {
  const params = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params[key] = value
  })
  return params
}

export const useLeadsOverviewReport = (filters = {}) =>
  useQuery({
    queryKey: ['reports', 'leads-overview', filters],
    queryFn: async () => {
      const response = await axios.get('/reports/leads-overview', {
        params: buildParams(filters),
      })
      return response.data.data
    },
  })

export const useLeadConversionReport = (filters = {}) =>
  useQuery({
    queryKey: ['reports', 'lead-conversion', filters],
    queryFn: async () => {
      const response = await axios.get('/reports/lead-conversion', {
        params: buildParams(filters),
      })
      return response.data.data
    },
  })

export const useVisitsSummaryReport = (filters = {}) =>
  useQuery({
    queryKey: ['reports', 'visits-summary', filters],
    queryFn: async () => {
      const response = await axios.get('/reports/visits-summary', {
        params: buildParams(filters),
      })
      return response.data.data
    },
  })


