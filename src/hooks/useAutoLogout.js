import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/toast";

const INACTIVITY_LIMIT = 10 * 60 * 1000; // 5 minutes

export const useAutoLogout = (onLogout) => {
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const resetTimer = () => {
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      onLogout(); // backend logout mutation
      localStorage.removeItem("token");
      navigate("/login");
    //   alert("Session expired due to inactivity");
    notify.info("Logged out due to inactivity");

    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((e) =>
      window.addEventListener(e, resetTimer)
    );

    resetTimer(); // start timer

    return () => {
      clearTimeout(timerRef.current);
      events.forEach((e) =>
        window.removeEventListener(e, resetTimer)
      );
    };
  }, []);
};
