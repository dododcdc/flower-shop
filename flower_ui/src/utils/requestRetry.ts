import { ApiErrorHandler, ApiError } from './errorHandler';
import { logger } from './logger';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: ApiError) => boolean;
  onRetry?: (attempt: number, error: ApiError) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error) => ApiErrorHandler.isRetryable(error),
  onRetry: (attempt, error) => {
    logger.warn(`Retrying request (attempt ${attempt}) after error:`, error.message);
  }
};

/**
 * 延迟函数
 */
const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * 带重试机制的请求包装器
 */
export function withRetry<T extends any[], R>(
  apiCall: (...args: T) => Promise<R>,
  options: RetryOptions = {}
): (...args: T) => Promise<R> {
  const {
    maxRetries,
    retryDelay,
    retryCondition,
    onRetry
  } = { ...DEFAULT_RETRY_OPTIONS, ...options };

  return async (...args: T): Promise<R> => {
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall(...args);
      } catch (error) {
        const apiError = ApiErrorHandler.handleError(error);
        lastError = apiError;

        // 如果不满足重试条件或已经是最后一次尝试，直接抛出错误
        if (attempt === maxRetries || !retryCondition(apiError)) {
          throw new Error(ApiErrorHandler.getUserFriendlyMessage(apiError));
        }

        // 调用重试回调
        if (onRetry) {
          onRetry(attempt + 1, apiError);
        }

        // 等待后重试（指数退避）
        const backoffDelay = retryDelay * Math.pow(2, attempt);
        await delay(backoffDelay);
      }
    }

    // 理论上不会执行到这里，但为了类型安全
    throw new Error(lastError ? ApiErrorHandler.getUserFriendlyMessage(lastError) : '请求失败');
  };
}

/**
 * 创建带重试的API调用配置
 */
export function createRetryConfig(options?: RetryOptions): RetryOptions {
  return {
    maxRetries: 2, // API调用默认重试2次
    retryDelay: 500, // 500ms基础延迟
    ...options
  };
}

export default withRetry;