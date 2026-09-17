import axios from "axios";
import API_URL from "./config";
import clientCache from "../utils/cache";

const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRedirecting = false;

apiClient.interceptors.response.use(
  (response) => {
    // Automatically invalidate corresponding cache namespaces on state-changing requests
    const method = response.config?.method?.toLowerCase();
    const url = response.config?.url || "";

    if (["post", "put", "delete", "patch"].includes(method)) {
      if (url.includes("/jobs")) {
        clientCache.invalidateNamespace("jobs");
      }
      if (url.includes("/api/aggregator")) {
        clientCache.invalidateNamespace("aggregator");
        clientCache.invalidateNamespace("jobs");
      }
      if (url.includes("/user") || url.includes("/profile")) {
        clientCache.invalidateNamespace("user");
      }
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      clientCache.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

/**
 * Perform a cached GET request via axios
 *
 * @param {string} url
 * @param {object} config - Axios request config
 * @param {object} cacheOptions - { ttl, swr, persist }
 */
apiClient.getCached = async function (url, config = {}, cacheOptions = {}) {
  const paramsKey = config.params ? JSON.stringify(config.params) : "";
  const cacheKey = `api:${url}:${paramsKey}`;

  return clientCache.fetchWithCache(
    cacheKey,
    async () => {
      const res = await apiClient.get(url, config);
      return res.data;
    },
    cacheOptions
  );
};

export default apiClient;