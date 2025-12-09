import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../lib/axios.js'

// Fetch all employees with pagination
export const useFetchEmployees = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['employees', page, limit],
    queryFn: async () => {
      const response = await axios.get('/employees/all', {
        params: {
          page,
          limit,
        },
      })
      
      // Handle response structure from backend
      const data = response.data;
      return {
        employees: data.employees || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / limit),
      }
    },
  })
}

// Add new employee
export const useAddEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (employeeData) => {
      const response = await axios.post('/employees/register', employeeData)
      return response.data.employee
    },
    onSuccess: (newEmployee) => {
      // Update cache with new employee
      // queryClient.setQueryData(['employees'], (oldData) => {
      //   return [...(oldData || []), newEmployee]
      queryClient.invalidateQueries({ queryKey: ['employees']
      })
    },
  })
}

// Update employee (including permissions)
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ employeeId, updateData }) => {
      const response = await axios.put(
        `/employees/update/${employeeId}`,
        updateData
      )
      return response.data.employee || response.data
    },
    onSuccess: () => {
      // Invalidate all employee queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

// Delete employee
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId) => {
      const response = await axios.delete(`/employees/${employeeId}`);
      return employeeId;
    },
    onSuccess: () => {
      // Invalidate all paginated employees queries so the table updates automatically
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
