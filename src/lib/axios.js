import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://bakra-software-backend.onrender.com/api/",
 baseURL: "http://localhost:3001/api",
    withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
