import Axios, { AxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// Add a request interceptor to include the auth token
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    // Get token from localStorage or session
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Normalize URL: if baseURL already includes the service prefix (e.g. '/api/selfin')
    // and the generated path also starts with '/api/', strip the extra '/api' so
    // requests become '/api/selfin/v1/...' instead of '/api/selfin/api/v1/...'.
    try {
      const base = config.baseURL || AXIOS_INSTANCE.defaults.baseURL;
      if (
        typeof base === "string" &&
        typeof config.url === "string" &&
        (base.endsWith("/selfin") || base.includes("/api/selfin")) &&
        config.url.startsWith("/api/")
      ) {
        config.url = config.url.replace(/^\/api/, "");
      }
    } catch (e) {
      // ignore normalization errors
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default customInstance;
