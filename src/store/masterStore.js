

import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

// ⚠️ DEPRECATED: This store is now managed by TanStack Query
// Import from hooks/useMastersQueries.js instead:
// - useFetchMasters()
// - useSaveMasters()

export const useMastersStore = create((set, get) => ({
  masters: {
    propertyTypes: [],
    subPropertyTypes: [],
    sources: [],
    cities: [],
  },

  loading: false,

}));
