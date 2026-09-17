// api/request.service.ts
import { apiClient } from "./client";
import { useLoadingStore } from "./loading.service";
import { toast } from "sonner";
import { AxiosRequestConfig } from "axios";

export interface RequestParam {
  data?: any;
  is_loading?: boolean;
  is_alert_error?: boolean;
}

export enum APIResponseCodeEnum {
  user_error = 400,
  expired_token = 401,
  invalid_token = 402,
  invalid_oauth_token = 403,
  not_found = 404,
  server_error = 500,
  gate_way_time_out = 504,
}

export class RequestService {
  getUrl(path: string, queryParams?: { [key: string]: any }) {
    let arr = path.split("/").filter((v) => v);
    arr.unshift(process.env.VITE_API_URL || "");
    const urlPath = arr.join("/");
    if (queryParams) {
      this.clean(queryParams, true);
      const url = new URL(urlPath);
      for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.append(key, value);
      }
      return url.toString();
    }

    return urlPath;
  }

  clean(obj: any, isCleanQuery = false): void {
    if (!obj || typeof obj !== "object") return;
    for (const propName in obj) {
      if (
        obj[propName] === undefined ||
        (isCleanQuery && obj[propName] === null)
      ) {
        delete obj[propName];
      } else if (obj[propName] instanceof Date) {
        const d = new Date(obj[propName]);
        d.setMilliseconds(0);
        obj[propName] = d.toISOString();
      } else if (
        typeof obj[propName] === "object" &&
        !(obj[propName] instanceof File) &&
        !(obj[propName] instanceof Blob)
      ) {
        this.clean(obj[propName], isCleanQuery);
      }
    }
  }

  toFormData(formValue: any): FormData {
    if (formValue instanceof FormData) {
      return formValue;
    }
    const formData = new FormData();
    const fileKeys: string[] = [];

    if (formValue && typeof formValue === "object") {
      for (const key of Object.keys(formValue)) {
        const value = formValue[key];
        if (value === undefined || value === null) continue;

        if (
          value instanceof File ||
          value instanceof Blob ||
          (typeof value === "object" && typeof value.name === "string")
        ) {
          fileKeys.push(key);
          continue;
        }
        formData.append(key, value);
      }
      for (const key of fileKeys) {
        formData.append(key, formValue[key]);
      }
    }
    return formData;
  }

  private handleHttpError(error: any, is_alert_error?: boolean) {
    if (is_alert_error) {
      const status = error?.response?.status || error?.status;
      const errorData = error?.response?.data || error?.error;

      if (status === APIResponseCodeEnum.user_error) {
        toast.error(
          typeof errorData === "string" ? errorData : "Invalid input data",
        );
      } else if (status === APIResponseCodeEnum.server_error) {
        toast.error(
          typeof errorData === "string"
            ? errorData
            : error?.message || error?.statusText || "Server Error",
        );
      } else if (status === APIResponseCodeEnum.gate_way_time_out) {
        toast.error("Gateway Time out");
      }
    }
    return Promise.reject(error?.response?.data || error);
  }

  private finalizeRequest(is_loading?: boolean) {
    if (is_loading) {
      useLoadingStore.getState().setLoading(false);
    }
  }

  async get<TResponse = any>(
    path: string,
    request: RequestParam = {},
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data, true);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    try {
      const res = await apiClient.get<TResponse>(path, {
        params: request.data,
      });
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async getBlob(path: string, request: RequestParam = {}): Promise<Blob> {
    const url = this.getUrl(path);
    this.clean(request.data, true);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    try {
      const res = await apiClient.get<Blob>(url, {
        params: request.data,
        responseType: "blob",
      });
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async getJSON<TResponse = any>(
    path: string,
    request: RequestParam = {},
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data, true);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    try {
      const res = await apiClient.get<TResponse>(url, {
        params: request.data,
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async post<TResponse = any>(
    path: string,
    request: RequestParam = {},
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    const formData = this.toFormData(request.data);

    try {
      const res = await apiClient.post<TResponse>(url, formData, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async postJSON<TResponse = any>(
    path: string,
    request: RequestParam = {},
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    try {
      const res = await apiClient.post<TResponse>(url, request.data, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async postFile<TResponse = any>(
    path: string,
    request: RequestParam = {},
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    const formData = this.toFormData(request.data);

    try {
      const res = await apiClient.post<TResponse>(url, formData, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async postFileProgress<TResponse = any>(
    path: string,
    request: RequestParam = {},
    onProgress?: (percent: number) => void,
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    const formData = this.toFormData(request.data);

    const config: AxiosRequestConfig = {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    };

    try {
      const res = await apiClient.post<TResponse>(url, formData, config);
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async patchJSON<TResponse = any>(
    path: string,
    request: RequestParam = {},
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    try {
      const res = await apiClient.patch<TResponse>(url, request.data, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async patchFile<TResponse = any>(
    path: string,
    request: RequestParam = {},
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    const formData = this.toFormData(request.data);

    try {
      const res = await apiClient.patch<TResponse>(url, formData, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async patchFileProgress<TResponse = any>(
    path: string,
    request: RequestParam = {},
    onProgress?: (percent: number) => void,
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    const formData = this.toFormData(request.data);

    const config: AxiosRequestConfig = {
      headers: {
        ...this.getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    };

    try {
      const res = await apiClient.patch<TResponse>(url, formData, config);
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async deleteJSON<TResponse = any>(
    path: string,
    request: RequestParam = {},
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    try {
      const res = await apiClient.delete<TResponse>(url, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        params: request.data,
      });
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }

  async multiDelete<TResponse = any>(
    path: string,
    request: RequestParam = {},
  ): Promise<TResponse> {
    const url = this.getUrl(path);
    this.clean(request.data);
    if (request.is_loading) {
      useLoadingStore.getState().setLoading(true);
    }

    try {
      const res = await apiClient.delete<TResponse>(url, {
        headers: {
          ...this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        data: request.data,
      });
      return res.data;
    } catch (err) {
      return this.handleHttpError(err, request.is_alert_error);
    } finally {
      this.finalizeRequest(request.is_loading);
    }
  }
  private getAuthHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const requestService = new RequestService();

// Standalone function exports for convenience
export const getUrl = requestService.getUrl.bind(requestService);
export const get = requestService.get.bind(requestService);
export const getBlob = requestService.getBlob.bind(requestService);
export const getJSON = requestService.getJSON.bind(requestService);
export const post = requestService.post.bind(requestService);
export const postJSON = requestService.postJSON.bind(requestService);
export const postFile = requestService.postFile.bind(requestService);
export const postFileProgress =
  requestService.postFileProgress.bind(requestService);
export const patchJSON = requestService.patchJSON.bind(requestService);
export const patchFile = requestService.patchFile.bind(requestService);
export const patchFileProgress =
  requestService.patchFileProgress.bind(requestService);
export const deleteJSON = requestService.deleteJSON.bind(requestService);
export const multiDelete = requestService.multiDelete.bind(requestService);
