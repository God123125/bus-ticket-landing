// api/client.ts
import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { isTokenExpired, clearAuthSession } from "@/lib/auth";

const getBaseUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return (
      import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || ""
    );
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
    const accessToken = localStorage.getItem("bus_bookings.access_token");
    if (token) {
      if (isTokenExpired(token)) {
        clearAuthSession();
      } else {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }
    if (accessToken) {
      config.headers.set("x-booking-token", accessToken);
    }
    if (!(config.data instanceof FormData)) {
      config.headers.set("Content-Type", "application/json");
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// equivalent to catchError(handleHttpError)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthSession();
    }
    return Promise.reject(error);
  },
);
