import { create } from "zustand";
import axios from "../lib/axios.js";

// ⚠️ DEPRECATED: This store is now managed by TanStack Query
// Import from hooks/useEmployeeQueries.js instead:
// - useFetchEmployees()
// - useAddEmployee()
// - useUpdateEmployee()
// - useDeleteEmployee()

export const useEmployeeStore = create((set) => ({
  employees: [],
  loading: false,
  error: null,

  
}));
