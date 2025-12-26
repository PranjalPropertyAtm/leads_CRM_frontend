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


export default axiosInstance;
