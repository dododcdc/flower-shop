import api from './axiosClient';

export interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
}

export interface CreateOrderRequest {
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    deliveryDate: string; // ISO date string
    deliveryTime: string; // HH:mm format
    cardContent?: string | undefined;
    cardSender?: string | undefined;
    items: OrderItem[];
}

export interface Order {
    id: number;
    orderNo: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    finalAmount: number;
    deliveryFee: number;
    status: string; // "PENDING" | "PAID" | "PREPARING" | "DELIVERING" | "COMPLETED" | "CANCELLED"
    paymentMethod: string;
    paymentStatus: string;
    deliveryTime?: string;
    notes?: string;
    cardContent?: string;
    cardSender?: string;
    createdAt: string;
    updatedAt: string;
}

export const orderAPI = {
    /**
     * 创建订单
     */
    createOrder: async (request: CreateOrderRequest): Promise<Order> => {
        const response = await api.post('/orders', request);
        return response.data.data;
    },

    /**
     * 根据手机号查询订单（分页）
     */
    getOrdersByPhone: async (phone: string, status?: string, page: number = 1, size: number = 10): Promise<{
        records: Order[];
        total: number;
        size: number;
        current: number;
        pages: number;
    }> => {
        console.log('查询参数:', { phone, status, page, size }); // 调试日志
        const response = await api.get('/orders/by-phone', {
            params: { phone, status, page, size }
        });
        return response.data.data;
    },

    /**
     * 查询当前登录用户的订单（分页）
     */
    getMyOrders: async (status?: string, page: number = 1, size: number = 10): Promise<{
        records: Order[];
        total: number;
        size: number;
        current: number;
        pages: number;
    }> => {
        const response = await api.get('/orders/my', {
            params: { status, page, size }
        });
        console.log('getMyOrders Response:', response.data); // Debug log

        if (response.data.code !== 200) {
            throw new Error(response.data.message || '查询订单失败');
        }

        return response.data.data;
    },
};
