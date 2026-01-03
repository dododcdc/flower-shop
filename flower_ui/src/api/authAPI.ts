import api from './axiosClient';
import { LoginRequest, LoginResponse } from '../models/auth';
import { STORAGE_KEYS } from '../constants';
import axios, { AxiosInstance } from 'axios';

type ApiResponse<T> = { code: number; message: string; data: T; timestamp?: number };

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<ApiResponse<LoginResponse>>('/admin/auth/login', payload);

  // 验证响应码
  if (res.data.code !== 200) {
    throw new Error(res.data.message || '登录失败');
  }

  // Handle potential variations in backend response shape
  const rawData = res.data;
  const loginData: LoginResponse = rawData?.data ?? rawData;

  const token = loginData?.token;
  if (token) {
    // Persist token with consistent key name
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    // Set default header for subsequent requests
    const axiosInstance = api as AxiosInstance;
    if (axiosInstance.defaults?.headers?.common) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  return loginData;
}
