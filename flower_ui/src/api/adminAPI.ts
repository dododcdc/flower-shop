import api from './axiosClient';
import { UserInfoResponse } from '../models/user';

type ApiResponse<T> = { code: number; message: string; data: T; timestamp?: number };

export async function getInfo(): Promise<UserInfoResponse> {
  const res = await api.get<ApiResponse<UserInfoResponse>>('/api/admin/auth/info');
  return res.data?.data as UserInfoResponse;
}
