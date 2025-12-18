import api from './axiosClient';
import { LoginRequest, LoginResponse } from '../models/auth';
import { STORAGE_KEYS } from '../constants';
import { AxiosInstance } from 'axios';

// 定义泛型API响应结构
type ApiResponse<T> = { code: number; message: string; data: T; timestamp?: number };

export interface UserRegisterRequest {
    username: string;
    password: string;
    confirmPassword: string;
    phone: string;
    email?: string;
}

export const userAPI = {
    /**
     * 用户注册
     */
    register: async (payload: UserRegisterRequest): Promise<string> => {
        const res = await api.post<ApiResponse<string>>('/auth/register', payload);
        if (res.data.code !== 200) {
            throw new Error(res.data.message || '注册失败');
        }
        return res.data.data || res.data.message;
    },

    /**
     * 用户登录
     */
    login: async (payload: LoginRequest): Promise<LoginResponse> => {
        const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', payload);

        // 必须校验业务状态码
        if (res.data.code !== 200) {
            throw new Error(res.data.message || '登录失败');
        }

        const loginData = res.data.data;
        if (!loginData) {
            throw new Error('服务器返回数据为空');
        }

        const token = loginData?.token;
        if (token) {
            // 保存Token到本地存储
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);

            // 设置Axios默认Header
            const axiosInstance = api as AxiosInstance;
            if (axiosInstance.defaults?.headers?.common) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        }
        return loginData;
    }
};
