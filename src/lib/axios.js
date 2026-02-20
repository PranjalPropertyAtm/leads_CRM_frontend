// import axios from "axios";

// const axiosInstance = axios.create({
//  baseURL: "https://leads-crm-backend.onrender.com/api",
// //  baseURL: "http://localhost:3001/api",
//     withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default axiosInstance;


// import axios from "axios";

// // 🔥 Auto detect backend URL
// const isLocalhost =
//   window.location.hostname === "localhost" ||
//   window.location.hostname === "127.0.0.1";

// const baseURL = isLocalhost
//   ? "http://localhost:3001/api"
//   : "https://leads-crm-backend.onrender.com/api";

// const axiosInstance = axios.create({
//   baseURL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default axiosInstance;


import axios from "axios";

// 🔥 Auto detect backend URL
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const baseURL = isLocalhost
  ? "http://localhost:3001/api"
  : "https://leads-crm-backend.onrender.com/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// For FormData (e.g. registration with payment screenshot), omit Content-Type so axios sets multipart/form-data with boundary
axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// ❗ Auto logout on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url;

    // ❌ Login API ke liye auto logout mat karo
    if (status === 401 && !url?.includes("/auth/login")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

/** Base URL for API (e.g. http://localhost:3001/api) */
export const apiBaseURL = baseURL;

/**
 * URL for a payment screenshot. Supports:
 * - Cloudinary: full URL (https://res.cloudinary.com/...) → returned as-is
 * - Legacy: relative path (e.g. payment-screenshots/xxx.png) → backend /uploads/ URL
 */
export const getUploadsUrl = (pathOrUrl) => {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return null;
  const s = pathOrUrl.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const base = baseURL.replace(/\/api\/?$/, "");
  return `${base}/uploads/${s.replace(/^\/+/, "")}`;
};

export default axiosInstance;
