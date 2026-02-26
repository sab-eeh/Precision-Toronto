import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true
});

/* 🔐 Attach token automatically */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (error.status === 401) {
      localStorage.removeItem("token");
      window.location.replace("/secure-ptx-portal-9a7x");
    }
    return Promise.reject(err);
  }
);

export default API;
