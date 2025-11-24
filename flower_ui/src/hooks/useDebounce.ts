import { useState, useEffect, useRef } from 'react';

/**
 * 防抖Hook
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖回调Hook
 * @param callback 回调函数
 * @param delay 延迟时间（毫秒）
 * @param deps 依赖数组
 * @returns 防抖后的回调函数
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // 更新回调引用
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return ((...args: Parameters<T>) => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }) as T;
}

/**
 * 防抖异步函数Hook
 * @param asyncFn 异步函数
 * @param delay 延迟时间（毫秒）
 * @returns 包含执行函数和加载状态的对象
 */
export function useDebouncedAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  delay: number
) {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const latestArgsRef = useRef<Parameters<T>>();

  const debouncedAsync = (...args: Parameters<T>) => {
    // 保存最新的参数
    latestArgsRef.current = args;

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置新的定时器
    timeoutRef.current = setTimeout(async () => {
      if (!latestArgsRef.current) return;

      setIsLoading(true);
      try {
        await asyncFn(...latestArgsRef.current);
      } catch (error) {
        // 错误由调用方处理
      } finally {
        setIsLoading(false);
      }
    }, delay);
  };

  // 取消当前待执行的调用
  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
  };

  return {
    debouncedAsync,
    isLoading,
    cancel
  };
}

export default useDebounce;