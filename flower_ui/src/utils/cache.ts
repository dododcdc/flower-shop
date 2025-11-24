import { logger } from './logger';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds, default 5 minutes
  maxSize?: number; // Maximum number of cached items, default 100
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private defaultTtl: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTtl = options.ttl || 5 * 60 * 1000; // 5 minutes

    // 定期清理过期缓存
    setInterval(() => {
      this.cleanupExpired();
    }, 60 * 1000); // Every minute
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl
    });

    logger.debug(`Cache set: ${key}`);
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
      const entry = this.cache.get(key);

    // 强制输出调试信息
    console.log(`🔍 CACHE CHECK: key=${key}, entry=${!!entry}, cacheSize=${this.cache.size}`);

    if (!entry) {
      logger.debug(`Cache miss: ${key}`);
      console.log(`❌ Cache MISS: ${key}`);
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      logger.debug(`Cache expired: ${key}`);
      console.log(`⏰ Cache EXPIRED: ${key}`);
      return null;
    }

    logger.debug(`Cache hit: ${key}`);
    console.log(`✅ Cache HIT: ${key}`);
    return entry.data as T;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    const existedBefore = this.cache.has(key);
    const deleted = this.cache.delete(key);

    // 强制输出调试信息
    console.log(`🗑️ CACHE DELETE ATTEMPT: key=${key}, existedBefore=${existedBefore}, deleted=${deleted}`);

    if (existedBefore && deleted) {
      logger.info(`Cache deleted successfully: ${key}`);
      console.log(`✅ Cache deleted successfully: ${key}`);
    } else if (!existedBefore) {
      logger.warn(`Cache key not found for deletion: ${key}`);
      console.log(`⚠️ Cache key not found: ${key}`);
    } else if (!deleted) {
      logger.error(`Failed to delete cache key: ${key}`);
      console.log(`❌ Failed to delete cache key: ${key}`);
    }

    return deleted;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.debug(`Cache cleared: ${size} items`);
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`Cache cleanup: ${cleanedCount} expired items removed`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 创建默认缓存实例
export const defaultCache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100
});

// 创建专门的API缓存实例
export const apiCache = new MemoryCache({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 50
});

/**
 * 带缓存的API调用包装器
 */
export function withCache<T extends any[], R>(
  apiCall: (...args: T) => Promise<R>,
  getCacheKey: (...args: T) => string,
  options: CacheOptions = {},
  cacheInstance?: MemoryCache
): (...args: T) => Promise<R> {
  // 使用提供的缓存实例，或者创建新的
  const cache = cacheInstance || new MemoryCache(options);

  return async (...args: T): Promise<R> => {
    const cacheKey = getCacheKey(...args);

    // 尝试从缓存获取
    const cachedData = cache.get<R>(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }

    // 缓存未命中，调用API
    try {
      const result = await apiCall(...args);
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      // API调用失败，不缓存错误结果
      throw error;
    }
  };
}

/**
 * 清理特定模式的缓存
 */
export function clearCacheByPattern(pattern: RegExp, cache: MemoryCache = defaultCache): void {
  const stats = cache.getStats();
  let clearedCount = 0;

  stats.keys.forEach(key => {
    if (pattern.test(key)) {
      cache.delete(key);
      clearedCount++;
    }
  });

  logger.debug(`Cache cleared by pattern: ${clearedCount} items`);
}

export default MemoryCache;