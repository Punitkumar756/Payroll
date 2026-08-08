import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach access token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hrms_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("hrms_refresh_token");
        const { data } = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          { refreshToken: refresh },
        );
        localStorage.setItem("hrms_access_token", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default api;
