import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../lib/axios.js'

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await axios.post('/auth/login', { email, password })
      const token = response.data.token
      const user = response.data.user

      // Save token locally
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      return { user, token }
    },
    onSuccess: (data) => {
      // Set user in cache
      queryClient.setQueryData(['user'], data.user)
    },
  })
}

// Load user query
export const useLoadUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      if (!token) return null

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      const response = await axios.get('/auth/me')
      return response.data.user
    },
    retry: false,
  })
}

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null)
      queryClient.invalidateQueries()
    },
  })
}
