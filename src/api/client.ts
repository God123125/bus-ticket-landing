// api/client.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const getBaseUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || "";
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env.VITE_API_URL || process.env.REACT_APP_API_URL || "";
  }
  return "";
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
});

// equivalent to getAuthHeader()
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    config.headers.set("Content-Type", "application/json");
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// equivalent to catchError(handleHttpError)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // central place to log, show a toast, redirect on 401, etc.
    return Promise.reject(error);
  }
);

