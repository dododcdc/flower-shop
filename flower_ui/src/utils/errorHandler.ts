import { AxiosError } from 'axios';
import { ERROR_MESSAGES } from '../constants';
import { logger } from './logger';

export interface ApiError {
  code: number;
  message: string;
  type: 'NETWORK' | 'CLIENT' | 'SERVER' | 'UNKNOWN';
  details?: any;
}

/**
 * API错误处理类
 */
export class ApiErrorHandler {
  /**
   * 处理API错误
   */
  static handleError(error: any): ApiError {
    if (!error) {
      return this.createUnknownError();
    }

    // 网络错误
    if (!error.response && error.code) {
      return this.handleNetworkError(error);
    }

    // Axios响应错误
    if (error.response) {
      return this.handleResponseError(error);
    }

    // 请求取消错误
    if (error.code === 'ERR_CANCELED') {
      return {
        code: 0,
        message: '请求已取消',
        type: 'CLIENT'
      };
    }

    // 其他未知错误
    return this.createUnknownError(error);
  }

  /**
   * 处理网络错误
   */
  private static handleNetworkError(error: any): ApiError {
    logger.error('Network error:', error);

    const networkErrors: Record<string, string> = {
      'ENOTFOUND': ERROR_MESSAGES.NETWORK_ERROR,
      'ECONNREFUSED': ERROR_MESSAGES.NETWORK_ERROR,
      'ETIMEDOUT': '请求超时，请检查网络连接',
      'ECONNRESET': '连接被重置，请重试',
    };

    return {
      code: 0,
      message: networkErrors[error.code] || ERROR_MESSAGES.NETWORK_ERROR,
      type: 'NETWORK',
      details: { code: error.code, message: error.message }
    };
  }

  /**
   * 处理响应错误
   */
  private static handleResponseError(error: AxiosError): ApiError {
    const status = error.response?.status || 0;
    const data = error.response?.data as any;

    logger.error('API response error:', { status, data, url: error.config?.url });

    switch (status) {
      case 400:
        return {
          code: status,
          message: data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
          type: 'CLIENT',
          details: data
        };

      case 401:
        return {
          code: status,
          message: ERROR_MESSAGES.UNAUTHORIZED,
          type: 'CLIENT'
        };

      case 403:
        return {
          code: status,
          message: ERROR_MESSAGES.FORBIDDEN,
          type: 'CLIENT'
        };

      case 404:
        return {
          code: status,
          message: ERROR_MESSAGES.NOT_FOUND,
          type: 'CLIENT'
        };

      case 422:
        return {
          code: status,
          message: data?.message || '请求数据格式错误',
          type: 'CLIENT',
          details: data
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          code: status,
          message: ERROR_MESSAGES.SERVER_ERROR,
          type: 'SERVER',
          details: data
        };

      default:
        return {
          code: status,
          message: data?.message || '服务器返回未知错误',
          type: 'UNKNOWN',
          details: data
        };
    }
  }

  /**
   * 创建未知错误
   */
  private static createUnknownError(error?: any): ApiError {
    logger.error('Unknown error:', error);

    return {
      code: 0,
      message: '发生未知错误，请稍后重试',
      type: 'UNKNOWN',
      details: error
    };
  }

  /**
   * 获取用户友好的错误消息
   */
  static getUserFriendlyMessage(apiError: ApiError): string {
    // 对于某些错误类型，可以根据实际场景提供更友好的消息
    if (apiError.type === 'NETWORK') {
      return '网络连接不稳定，请检查网络后重试';
    }

    if (apiError.code === 422 && apiError.details) {
      // 处理表单验证错误
      if (typeof apiError.details === 'object' && apiError.details.errors) {
        const firstError = Object.values(apiError.details.errors)[0] as string;
        return firstError || apiError.message;
      }
    }

    return apiError.message;
  }

  /**
   * 判断是否需要重新登录
   */
  static shouldReLogin(apiError: ApiError): boolean {
    return apiError.code === 401;
  }

  /**
   * 判断是否为可重试错误
   */
  static isRetryable(apiError: ApiError): boolean {
    return (
      apiError.type === 'NETWORK' ||
      apiError.code === 500 ||
      apiError.code === 502 ||
      apiError.code === 503 ||
      apiError.code === 504
    );
  }
}

/**
 * 创建带错误处理的API调用包装器
 */
export function withErrorHandling<T extends any[], R>(
  apiCall: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await apiCall(...args);
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error);

      // 如果需要重新登录，跳转到登录页
      if (ApiErrorHandler.shouldReLogin(apiError)) {
        const currentPath = window.location.pathname;
        const loginPath = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
        window.location.href = loginPath;
      }

      throw new Error(ApiErrorHandler.getUserFriendlyMessage(apiError));
    }
  };
}

export default ApiErrorHandler;