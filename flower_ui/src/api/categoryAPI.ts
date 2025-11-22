import axiosClient from './axiosClient';

export interface Category {
    id: number;
    name: string;
    description?: string;
    parentId?: number;
    level?: number;
    sortOrder?: number;
    status?: number;
    icon?: string;
    children?: Category[];
}

// Response type for API calls
type ApiResponse<T> = {
    code: number;
    message: string;
    data: T;
};

const ENDPOINTS = {
    CATEGORIES: '/categories',
    LIST: '/categories/list',
} as const;

export const categoryAPI = {
    /**
     * Get all categories (flat list)
     */
    getCategoryTree: async (): Promise<Category[]> => {
        const response = await axiosClient.get<ApiResponse<Category[]>>(ENDPOINTS.LIST);
        return response.data.data;
    },

    /**
     * Get all categories (flat list)
     */
    getAllCategories: async (): Promise<Category[]> => {
        const response = await axiosClient.get<ApiResponse<Category[]>>(ENDPOINTS.LIST);
        return response.data.data;
    }
};

export default categoryAPI;
