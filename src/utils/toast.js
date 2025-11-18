import { toast } from "react-toastify";

export const notify = {
  success: (msg) =>
    toast(msg, {
      type: "success",
      style: {
        background: "#f0fdf4", // light green
        color: "#166534", // dark green text
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
      },
    }),

  error: (msg) =>
    toast(msg, {
      type: "error",
      style: {
        background: "#fef2f2", // light red
        color: "#991b1b",
        border: "1px solid #fecaca",
        borderRadius: "8px",
      },
    }),

  warning: (msg) =>
    toast(msg, {
      type: "warning",
      style: {
        background: "#fffbeb", // light yellow
        color: "#92400e",
        border: "1px solid #fde68a",
        borderRadius: "8px",
      },
    }),

  info: (msg) =>
    toast(msg, {
      type: "info",
      style: {
        background: "#eff6ff", // light blue
        color: "#1e3a8a",
        border: "1px solid #bfdbfe",
        borderRadius: "8px",
      },
    }),
};
