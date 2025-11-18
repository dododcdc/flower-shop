// 认证相关的TypeScript类型定义

// 登录请求数据
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应数据
export interface LoginResponse {
  token: string
  userId: number
  username: string
  role: string
  email: string
  phone: string
  lastLogin: string
}

// 用户基本信息
export interface User {
  userId: number
  username: string
  role: string
  email: string
  phone: string
  lastLogin: string
}

// API统一响应格式
export interface Result<T> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 认证状态接口
export interface AuthState {
  // 用户信息
  user: User | null
  // JWT token
  token: string | null
  // 是否已认证
  isAuthenticated: boolean
  // 加载状态
  isLoading: boolean
  // 错误信息
  error: string | null
}

// 认证操作接口
export interface AuthActions {
  // 登录
  login: (credentials: LoginRequest) => Promise<void>
  // 登出
  logout: () => void
  // 清除错误
  clearError: () => void
  // 设置加载状态
  setLoading: (loading: boolean) => void
  // 检查认证状态
  checkAuth: () => void
}

// 完整的认证Store接口
export interface AuthStore extends AuthState, AuthActions {}

// 表单验证错误类型
export interface FormErrors {
  username?: string
  password?: string
  submit?: string
}

// 系统初始化请求数据
export interface InitRequest {
  username: string
  password: string
  email: string
}

// 应用路由配置
export interface RouteConfig {
  path: string
  element: React.ComponentType
  isProtected?: boolean
}

// 响应状态码
export const ResponseCode = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// 用户角色
export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const

// 登录表单字段配置
export interface LoginFormFieldConfig {
  name: keyof LoginRequest
  label: string
  type: 'text' | 'password'
  required: boolean
  placeholder: string
  autoComplete?: string
}

// Material UI主题相关类型
export interface ThemeConfig {
  palette: {
    primary: {
      main: string
      light: string
      dark: string
    }
    secondary: {
      main: string
      light: string
      dark: string
    }
  }
  typography: {
    fontFamily: string
  }
}

// API错误类型
export interface ApiError {
  code: number
  message: string
  details?: any
}

// 本地存储键名
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  TOKEN: 'auth-token',
  USER: 'auth-user',
} as const

// 默认配置
export const AUTH_CONFIG = {
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24小时（毫秒）
  API_TIMEOUT: 10000, // 10秒
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_TIME: 15 * 60 * 1000, // 15分钟
} as const