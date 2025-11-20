import axios from 'axios';
import { LoginRequest, LoginResponse } from '../models/auth';

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>('/api/admin/auth/login', payload);
  return res.data;
}
