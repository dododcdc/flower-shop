import api from './axiosClient';
import { LoginRequest, LoginResponse } from '../models/auth';

type ApiResponse<T> = { code: number; message: string; data: T; timestamp?: number };

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<ApiResponse<LoginResponse>>('/api/admin/auth/login', payload);
  // Handle potential variations in backend response shape
  const raw: any = res.data;
  const loginData: LoginResponse | undefined = raw?.data ?? raw;
  const token = loginData?.token;
  if (token) {
    // Persist token and set default header for subsequent requests on the axios instance
    (api as any).defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('flower_token', token);
  }
  return loginData as LoginResponse;
}
