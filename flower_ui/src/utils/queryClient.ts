import { QueryClient } from '@tanstack/react-query';

// 创建 QueryClient 实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据保持新鲜的时间：2分钟
      staleTime: 2 * 60 * 1000,
      // 缓存时间：5分钟
      gcTime: 5 * 60 * 1000,
      // 重试配置
      retry: (failureCount, error: any) => {
        // 401错误不重试（认证问题）
        if (error?.response?.status === 401) return false;
        // 网络错误或5xx错误最多重试2次
        if (error?.response?.status >= 500 || !error.response) {
          return failureCount < 2;
        }
        // 其他错误不重试
        return false;
      },
      // 重试延迟
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 开发环境下启用错误日志
      logErrors: import.meta.env.DEV,
    },
    mutations: {
      // 变更操作的重试配置
      retry: (failureCount, error: any) => {
        // 变更操作通常不重试，除非是网络错误
        if (!error.response && failureCount < 1) return true;
        return false;
      },
    },
  },
});