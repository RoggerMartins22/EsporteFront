import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    const expirationString = localStorage.getItem("token_expiration");
    if (expirationString) {
      const expirationTimestamp = Number(expirationString);
      if (!isNaN(expirationTimestamp) && Date.now() < expirationTimestamp) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("token_expiration");
        delete config.headers.Authorization;
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    } else {
      localStorage.removeItem("token");
      delete config.headers.Authorization;
    }
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      originalRequest.url !== "/usuario/login" &&
      !originalRequest._retry 
    ) {
      originalRequest._retry = true;
      localStorage.removeItem("token");
      localStorage.removeItem("token_expiration");
      
      if (window.location.pathname !== "/login") {
         window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;