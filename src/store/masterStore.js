

import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useMastersStore = create((set, get) => ({
  masters: {
    propertyTypes: [],
    subPropertyTypes: [],
    sources: [],
    cities: [],
  },

  loading: false,

  // -------------------------
  // FETCH MASTERS
  // -------------------------
  fetchMasters: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/masters/");

      set({
        masters: res.data,   // backend returns full object
        loading: false,
      });

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch masters");
      set({ loading: false });
    }
  },

  // -------------------------
  // SAVE / UPDATE MASTERS
  // -------------------------
  saveMasters: async () => {
    try {
      set({ loading: true });

      const { masters } = get();
      const id = masters?._id;
      console.log("Saving masters with ID:", id, masters);

      // -------------------
      // CREATE
      // -------------------
      if (!id) {
        const res = await axios.post("/masters/create", masters);

        toast.success(res.data.message || "Masters created");
        set({ masters: res.data.data, loading: false });
        return;
      }

      // -------------------
      // UPDATE
      // -------------------
      const res = await axios.put(`/masters/update/${id}`, masters);

      toast.success(res.data.message || "Masters updated");
      set({ masters: res.data.data, loading: false });

    } catch (err) {
      console.error(err);
      toast.error("Failed to save masters");
      set({ loading: false });
    }
  },
}));
