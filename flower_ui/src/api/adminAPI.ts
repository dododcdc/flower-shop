import axios from 'axios';
import { UserInfoResponse } from '../models/user';

export async function getInfo(): Promise<UserInfoResponse> {
  const res = await axios.get<UserInfoResponse>('/api/admin/auth/info');
  return res.data;
}
