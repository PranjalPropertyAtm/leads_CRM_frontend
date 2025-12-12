import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios.js";

export const useFetchCustomers = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ["customers", page, limit],
    queryFn: async () => {
      const response = await axios.get("/customers/all", {
        params: { page, limit },
      });

      const data = response.data;

      return {
        customers: data.customers || [],   // FIXED
        total: data.total || 0,            // FIXED
        totalPages: data.totalPages || Math.ceil((data.total || 0) / limit),
        page: data.page || 1,
      };
    },
  });

export const useCustomerById = (id) =>
  useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data } = await axios.get(`/customers/${id}`);
      // backend returns { success, data: customer }
      return data.data || data.customer || data;
    },
  });
