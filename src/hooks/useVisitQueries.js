import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";

export const useAddVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post("/visits/add", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["visits"]);
      queryClient.invalidateQueries(["leadVisits"]);
      queryClient.invalidateQueries(["leads"]);
    }
  });
};

export const useMyVisits = () => {
  return useQuery({
    queryKey: ["visits", "my"],
    queryFn: async () => {
      const res = await axios.get("/visits/my");
      return res.data.data;
    }
  });
};

export const useAllVisits = () => {
  return useQuery({
    queryKey: ["visits", "all"],
    queryFn: async () => {
      const res = await axios.get("/visits/all");
      return res.data.data;
    }
  });
};

export const useLeadVisits = (leadId) => {
  return useQuery({
    queryKey: ["leadVisits", leadId],
    queryFn: async () => {
      const res = await axios.get(`/visits/lead/${leadId}`);
      return res.data.data;
    },
    enabled: !!leadId,
  });
};
