import api from './axiosClient';

export interface DashboardStats {
    todayOrderCount: number;
    todaySalesAmount: number;
    pendingOrderCount: number;
    lowStockCount: number;
}

export interface OrderDistribution {
    status: string;
    count: number;
    statusText: string;
}

export interface SalesTrend {
    date: string;
    amount: number;
    orderCount: number;
}

export interface RecentOrder {
    id: number;
    orderNo: string;
    customerName: string;
    customerPhone: string;
    finalAmount: number;
    status: string;
    statusText: string;
    createdAt: string;
    itemCount?: number;
}

export interface LowStockProduct {
    id: number;
    name: string;
    stockQuantity: number;
    lowStockThreshold: number;
    price: number;
    statusText: string;
}

export const dashboardAPI = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get('/dashboard/stats');
        return response.data.data;
    },

    getOrderDistribution: async (): Promise<OrderDistribution[]> => {
        const response = await api.get('/dashboard/order-distribution');
        return response.data.data;
    },

    getSalesTrend: async (): Promise<SalesTrend[]> => {
        const response = await api.get('/dashboard/sales-trend');
        return response.data.data;
    },

    getRecentOrders: async (): Promise<RecentOrder[]> => {
        const response = await api.get('/dashboard/recent-orders');
        return response.data.data;
    },

    getLowStockProducts: async (): Promise<LowStockProduct[]> => {
        const response = await api.get('/dashboard/low-stock');
        return response.data.data;
    },
};
