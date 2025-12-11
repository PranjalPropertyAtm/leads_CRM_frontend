// hooks/useSettingsQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios.js';
import { notify } from '../utils/toast.js';

// Get current user's profile
export const useGetProfile = () => {
  return useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: async () => {
      const response = await axios.get('/settings/profile');
      return response.data.user;
    },
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.put('/settings/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      notify.success(data.message || 'Profile updated successfully');
      // Invalidate and refetch user data
      queryClient.invalidateQueries(['settings', 'profile']);
      queryClient.invalidateQueries(['user']);
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.put('/settings/password', data);
      return response.data;
    },
    onSuccess: (data) => {
      notify.success(data.message || 'Password changed successfully');
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || 'Failed to change password');
    },
  });
};

