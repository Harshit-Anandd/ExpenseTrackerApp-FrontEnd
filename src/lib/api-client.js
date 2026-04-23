import axios from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/token-storage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

let refreshPromise = null;

const shouldSkipRefresh = (requestUrl = "") =>
  requestUrl.includes("/auth/login") ||
  requestUrl.includes("/auth/register") ||
  requestUrl.includes("/auth/refresh");

/**
 * Shared axios instance for API calls.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = getRefreshToken();

    if (
      error.response?.status === 401 &&
      refreshToken &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
            .then(({ data }) => {
              setAccessToken(data.accessToken);
              setRefreshToken(data.refreshToken);
              return data;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const refreshedTokens = await refreshPromise;

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization =
          `Bearer ${refreshedTokens.accessToken}`;

        return apiClient(originalRequest);
      } catch {
        clearTokens();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
