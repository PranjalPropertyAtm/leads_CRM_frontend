import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../lib/axios.js'

// Fetch masters
export const useFetchMasters = () => {
  return useQuery({
    queryKey: ['masters'],
    queryFn: async () => {
      const response = await axios.get('/masters/')
      return response.data
    },
  })
}

// Save/Update masters
export const useSaveMasters = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mastersData) => {
      const id = mastersData?._id

      // Create
      if (!id) {
        const response = await axios.post('/masters/create', mastersData)
        return response.data.data
      }

      // Update
      const response = await axios.put(`/masters/update/${id}`, mastersData)
      return response.data.data
    },
    onSuccess: (updatedMasters) => {
      queryClient.setQueryData(['masters'], updatedMasters)
    },
  })
}
