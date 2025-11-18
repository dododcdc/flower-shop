import axios, { AxiosError } from 'axios'
import type { AxiosInstance } from 'axios'

// API基础URL配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // 处理401未授权错误
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 响应数据类型定义
export interface Result<T> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 登录请求接口
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应接口
export interface LoginResponse {
  token: string
  userId: number
  username: string
  role: string
  email: string
  phone: string
  lastLogin: string
}

// 用户信息接口
export interface UserInfo {
  userId: number
  username: string
  role: string
  email: string
  phone: string
  lastLogin: string
}

// 网络错误处理函数
const handleNetworkError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError

    if (axiosError.code === 'NETWORK_ERROR' || axiosError.message.includes('Network Error')) {
      return '网络连接失败，请检查网络设置'
    }

    if (axiosError.response?.status === 400) {
      const responseData = axiosError.response.data as Result<any>
      return responseData.message || '请求参数错误'
    }

    if (axiosError.response?.status === 401) {
      return '用户名或密码错误'
    }

    if (axiosError.response?.status === 403) {
      return '访问被拒绝，权限不足'
    }

    if (axiosError.response?.status === 500) {
      return '服务器内部错误，请稍后重试'
    }

    if (axiosError.response?.status === 503) {
      return '服务暂时不可用，请稍后重试'
    }

    return `请求失败 (${axiosError.response?.status})`
  }

  if (error instanceof Error) {
    return error.message
  }

  return '未知错误，请联系管理员'
}

// 认证API服务
export const authAPI = {
  /**
   * 管理员登录
   */
  login: async (credentials: LoginRequest): Promise<Result<LoginResponse>> => {
    try {
      const response = await apiClient.post<Result<LoginResponse>>('/admin/auth/login', credentials)
      return response.data
    } catch (error) {
      const errorMessage = handleNetworkError(error)
      throw new Error(errorMessage)
    }
  },

  /**
   * 检查系统是否已初始化
   */
  checkInit: async (): Promise<Result<boolean>> => {
    try {
      const response = await apiClient.get<Result<boolean>>('/admin/init/check')
      return response.data
    } catch (error) {
      const errorMessage = handleNetworkError(error)
      throw new Error(errorMessage)
    }
  },

  /**
   * 初始化系统管理员
   */
  setupAdmin: async (adminData: { username: string; password: string; email: string }): Promise<Result<string>> => {
    try {
      const response = await apiClient.post<Result<string>>('/admin/init/setup', adminData)
      return response.data
    } catch (error) {
      const errorMessage = handleNetworkError(error)
      throw new Error(errorMessage)
    }
  },

  /**
   * 获取当前管理员信息
   */
  getCurrentUser: async (): Promise<Result<UserInfo>> => {
    try {
      const response = await apiClient.get<Result<UserInfo>>('/admin/auth/info')
      return response.data
    } catch (error) {
      const errorMessage = handleNetworkError(error)
      throw new Error(errorMessage)
    }
  },

  /**
   * 验证token有效性
   */
  verifyToken: async (): Promise<boolean> => {
    try {
      await apiClient.get('/admin/auth/info')
      return true
    } catch (error) {
      return false
    }
  },
}

// 导出apiClient供其他API使用
export default apiClient