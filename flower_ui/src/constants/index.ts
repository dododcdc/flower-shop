/**
 * 应用常量定义
 */

export const STORAGE_KEYS = {
  TOKEN: 'flower_shop_token',
  USER: 'flower_shop_user',
  THEME: 'flower_shop_theme',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/admin/auth/login',
    LOGOUT: '/admin/auth/logout',
    REFRESH: '/admin/auth/refresh',
  },
  PRODUCTS: {
    LIST: '/admin/products',
    CREATE: '/admin/products',
    UPDATE: '/admin/products',
    DELETE: '/admin/products',
    SEARCH: '/admin/products/search',
    IMAGES: '/admin/products/images',
  },
  ORDERS: {
    LIST: '/admin/orders',
    UPDATE: '/admin/orders',
    DETAILS: '/admin/orders',
  },
  CATEGORIES: {
    LIST: '/admin/categories',
    CREATE: '/admin/categories',
    UPDATE: '/admin/categories',
    DELETE: '/admin/categories',
  },
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '权限不足，无法访问此页面',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器内部错误，请稍后重试',
  VALIDATION_ERROR: '输入信息有误，请检查后重试',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出成功',
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  UPDATE_SUCCESS: '更新成功',
  UPLOAD_SUCCESS: '上传成功',
} as const;

export const UI_CONSTANTS = {
  PAGE_SIZE: 10,
  DEBOUNCE_DELAY: 300,
  FILE_SIZE_LIMIT: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
} as const;