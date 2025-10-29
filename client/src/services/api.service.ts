import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { storage } from '../common/utils/storage.util';
import type { ApiError } from '../common/types/api.types';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storage.getAccessToken();
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;

        if (status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.api(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = storage.getRefreshToken();

          if (!refreshToken) {
            this.isRefreshing = false;
            storage.clearAuth();
            return Promise.reject(this.handleError(error));
          }

          try {
            const response = await axios.post(
              `${API_CONFIG.baseURL}/auth/refresh`,
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            );

            const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;

            storage.setAccessToken(accessToken);
            storage.setRefreshToken(newRefreshToken);
            storage.setUser(user);

            this.processQueue(null, accessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            this.isRefreshing = false;
            return this.api(originalRequest);
          } catch (refreshError: any) {
            this.processQueue(refreshError, null);
            this.isRefreshing = false;
            storage.clearAuth();
            const handledError = this.handleError(refreshError);
            return Promise.reject(handledError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError<ApiError>): any {
    if (error.response?.data) {
      const apiError = error.response.data;
      
      if (typeof apiError === 'object' && apiError !== null) {
        return {
          ...apiError,
          message: apiError.message || `Error: ${error.response.status}`,
          statusCode: error.response.status,
        };
      }
      
      if (typeof apiError === 'string') {
        return {
          message: apiError,
          statusCode: error.response.status,
        };
      }
    }

    if (error.message) {
      return {
        message: error.message,
        statusCode: error.response?.status,
      };
    }

    return {
      message: error.response?.status === 401 
        ? 'Your session has expired. Please log in again.'
        : error.response?.status === 403
        ? 'You do not have permission to perform this action.'
        : error.response?.status === 404
        ? 'The requested resource was not found.'
        : `An unexpected error occurred (${error.response?.status || 'unknown'})`,
      statusCode: error.response?.status,
    };
  }

  public getApi(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.getApi();

