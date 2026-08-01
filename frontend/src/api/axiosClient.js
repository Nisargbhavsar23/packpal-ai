import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 30000, // 30s — AI endpoints may take time
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("packpal_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error responses for consistent frontend error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network failures (no response from server)
    if (!error.response) {
      return Promise.reject({
        ...error,
        response: {
          status: 0,
          data: { detail: "Network error. Please check your connection and try again." },
        },
      });
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
