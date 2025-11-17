import api from './api'
import { ApiResponse, LoginRequest, LoginResponse, AdminInitRequest } from '../types'

export const authService = {
  // 检查系统是否已初始化
  checkInitialization(): Promise<ApiResponse<boolean>> {
    return api.get<boolean>('/admin/init/check')
  },

  // 初始化管理员
  initializeAdmin(data: AdminInitRequest): Promise<ApiResponse<string>> {
    return api.post<string>('/admin/init/setup', data)
  },

  // 管理员登录
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return api.post<LoginResponse>('/admin/auth/login', data)
  },

  // 获取当前用户信息
  getCurrentUser(): Promise<ApiResponse<string>> {
    return api.get<string>('/admin/auth/info')
  },

  // 保存登录信息
  saveAuthInfo(response: LoginResponse) {
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify({
      id: response.userId,
      username: response.username,
      role: response.role,
      email: response.email,
      phone: response.phone
    }))
  },

  // 清除登录信息
  clearAuthInfo() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // 获取当前用户
  getCurrentUserFromStorage() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // 获取token
  getToken() {
    return localStorage.getItem('token')
  },

  // 检查是否已登录
  isLoggedIn() {
    return !!localStorage.getItem('token')
  }
}

export default authService