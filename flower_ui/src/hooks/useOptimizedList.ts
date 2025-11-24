import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { logger } from '../utils/logger';

interface UseOptimizedListOptions<T, F> {
  fetchData: (filters: F) => Promise<T[]>;
  initialFilters: F;
  debounceDelay?: number;
  cacheKey?: string;
  pageSize?: number;
}

interface UseOptimizedListReturn<T, F> {
  data: T[];
  loading: boolean;
  error: string | null;
  filters: F;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  updateFilters: (newFilters: Partial<F>) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  clearCache: () => void;
}

/**
 * 优化的列表Hook，支持缓存、防抖、分页等功能
 */
export function useOptimizedList<T, F>({
  fetchData,
  initialFilters,
  debounceDelay = 300,
  pageSize = 10,
}: UseOptimizedListOptions<T, F>): UseOptimizedListReturn<T, F> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<F>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // 防抖过滤器
  const debouncedFilters = useMemo(() => {
    const debounceMap = new Map<string, any>();
    let timeoutId: NodeJS.Timeout | null = null;

    return {
      get: () => {
        const key = JSON.stringify(filters);
        return debounceMap.get(key) || filters;
      },
      set: (newFilters: F) => {
        const key = JSON.stringify(newFilters);
        debounceMap.set(key, newFilters);

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          if (mountedRef.current) {
            setFilters(newFilters);
            setCurrentPage(1); // 重置页码
          }
        }, debounceDelay);
      }
    };
  }, [debounceDelay]);

  // 请求数据的核心函数
  const executeFetch = useCallback(async (
    requestFilters: F,
    page: number,
    append: boolean = false
  ): Promise<void> => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      // 构建请求参数
      const requestParams = {
        ...requestFilters,
        current: page,
        size: pageSize,
      };

      logger.debug('Fetching data with params:', requestParams);

      // 执行请求
      const responseData = await fetchData(requestParams as F);

      if (!mountedRef.current || controller.signal.aborted) {
        return;
      }

      // 假设API返回格式为 { data: T[], total: number }
      const response = responseData as any;
      const newData = response.data || response;
      const total = response.total || response.length || 0;

      if (append) {
        setData(prevData => [...prevData, ...newData]);
      } else {
        setData(newData);
      }

      setTotalCount(total);
      setHasMore(newData.length === pageSize && (page * pageSize) < total);

    } catch (err) {
      if (!controller.signal.aborted && mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : '加载数据失败';
        setError(errorMessage);
        logger.error('Failed to fetch data:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [fetchData, pageSize]);

  // 更新过滤器
  const updateFilters = useCallback((newFilters: Partial<F>) => {
    const updatedFilters = { ...filters, ...newFilters };
    debouncedFilters.set(updatedFilters);
  }, [filters, debouncedFilters]);

  // 设置页码
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 重置过滤器
  const resetFilters = useCallback(() => {
    debouncedFilters.set(initialFilters);
  }, [debouncedFilters, initialFilters]);

  // 刷新数据
  const refresh = useCallback(async () => {
    await executeFetch(filters, currentPage);
  }, [filters, currentPage, executeFetch]);

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await executeFetch(filters, nextPage, true);
    }
  }, [loading, hasMore, currentPage, filters, executeFetch]);

  // 清理缓存
  const clearCache = useCallback(() => {
    setData([]);
    setError(null);
    setCurrentPage(1);
    setTotalCount(0);
    setHasMore(false);
  }, []);

  // 当过滤器或页码变化时重新请求数据
  useEffect(() => {
    executeFetch(filters, currentPage);
  }, [filters, currentPage, executeFetch]);

  // 清理函数
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    filters,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageSize),
    hasMore,
    updateFilters,
    setPage,
    resetFilters,
    refresh,
    loadMore,
    clearCache,
  };
}

export default useOptimizedList;