import { create } from "zustand";
import axios from "../lib/axios.js";

export const useEmployeeStore = create((set) => ({
  employees: [],
  loading: false,
  error: null,

  // Fetch all employees
  fetchEmployees: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get("/employees/all");
      set({ employees: response.data.employees || [], loading: false });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to fetch employees";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Add new employee
  addEmployee: async (employeeData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post("/employees/register", employeeData);
      
      if (response.status === 201) {
        // Add new employee to the list
        set((state) => ({
          employees: [...state.employees, response.data.employee],
          loading: false,
        }));
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to add employee";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Update employee (including permissions)
  updateEmployee: async (employeeId, updateData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.put(`/employees/update/${employeeId}`, updateData);

      if (response.status === 200) {
        // Update employee in the list
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp._id === employeeId ? { ...emp, ...response.data.employee } : emp
          ),
          loading: false,
        }));
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update employee";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Delete employee
  deleteEmployee: async (employeeId) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.delete(`/employees/${employeeId}`);

      if (response.status === 200) {
        // Remove employee from the list
        set((state) => ({
          employees: state.employees.filter((emp) => emp._id !== employeeId),
          loading: false,
        }));
        return { success: true };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to delete employee";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
