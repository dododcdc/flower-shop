import axios, { AxiosInstance } from 'axios';
import { STORAGE_KEYS, API_BASE_URL } from '../constants';
import { ApiErrorHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';

// Centralized Axios instance for the frontend MVP
// Direct connection to backend server (port 8080)
const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token and timing
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求开始时间（用于性能监控）
    (config as any).metadata = { startTime: Date.now() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors and统一错误处理
instance.interceptors.response.use(
  (response) => {
    // 记录结束时间
    if ((response.config as any).metadata) {
      (response.config as any).metadata.endTime = Date.now();
    }

    // 记录成功请求（仅在开发环境）
    if (import.meta.env.DEV) {
      logger.debug(`API success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: (response.config as any).metadata?.endTime
          ? (response.config as any).metadata.endTime - (response.config as any).metadata.startTime
          : undefined
      });
    }
    return response;
  },
  (error) => {
    // 记录错误请求
    if (import.meta.env.DEV) {
      logger.error(`API error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
    }

    // 处理认证错误
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/admin/login';
      return Promise.reject(error);
    }

    // 统一错误处理
    const apiError = ApiErrorHandler.handleError(error);

    // 创建更友好的错误对象
    const enhancedError = new Error(ApiErrorHandler.getUserFriendlyMessage(apiError));
    enhancedError.name = 'ApiError';
    (enhancedError as any).apiError = apiError;

    return Promise.reject(enhancedError);
  }
);

export default instance;
