import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";

// -------------------------------
// ✅ Add Registration Hook
// -------------------------------
export const useAddRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post("/registrations/add", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["registrations"]);
      queryClient.invalidateQueries(["leads"]);
      queryClient.invalidateQueries(["myLeads"]);
    }
  });
};


// -------------------------------
// ✅ Get All Registrations (Admin Only)
// -------------------------------
export const useGetRegistrations = () => {
  return useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      const res = await axios.get("/registrations/all");
      return res.data.data; // returns array of registrations
    },
  });
};
