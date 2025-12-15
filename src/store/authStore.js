import React from "react";
import { create } from "zustand";
import axios from "../lib/axios.js";

// ---- AXIOS DEFAULT CONFIG ----
axios.defaults.baseURL = "http://localhost:3001/api"; 
axios.defaults.withCredentials = true;

// ⚠️ DEPRECATED: This store is now managed by TanStack Query
// Import from hooks/useAuthQueries.js instead:
// - useLogin()
// - useLoadUser()
// - useLogout()

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

}));
