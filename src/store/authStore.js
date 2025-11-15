import React from "react";
import { create } from "zustand";
import axios from "../lib/axios.js";

// ---- AXIOS DEFAULT CONFIG ----
axios.defaults.baseURL = "http://localhost:3001/api"; 
axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  // ---- LOGIN FUNCTION ----
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.post("/auth/login", { email, password });

      const token = res.data.token;
      const user = res.data.user;

      // Save token locally
      localStorage.setItem("token", token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({
        user: user,
        token: token,
        loading: false,
        error: null,
      });

      return { success: true };

    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Login failed",
      });

      return { success: false };
    }
  },

  loadUser: async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  try {
    const res = await axios.get("/auth/me"); // backend route user info return kare
    set({ user: res.data.user });
  } catch {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  }
},

  // ---- LOGOUT ----
  logout: () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    set({ user: null, token: null });
  }
}));
