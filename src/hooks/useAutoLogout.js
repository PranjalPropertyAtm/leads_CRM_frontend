import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/toast";
import axios from "../lib/axios.js";

const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

export const useAutoLogout = (onLogout) => {
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const onLogoutRef = useRef(onLogout);

  // Keep the logout function ref updated
  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      // Call the logout function
      if (onLogoutRef.current) {
        onLogoutRef.current();
      }
      
      // Ensure cleanup happens
      localStorage.removeItem("token");
      delete axios.defaults?.headers?.common?.Authorization;
      
      notify.info("Logged out due to inactivity");
      navigate("/login");
    }, INACTIVITY_LIMIT);
  }, [navigate]);

  useEffect(() => {
    // Only activate if user is logged in
    const token = localStorage.getItem("token");
    if (!token) return;

    // Events that indicate user activity
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "click", "scroll"];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Start the timer
    resetTimer();

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);
};
