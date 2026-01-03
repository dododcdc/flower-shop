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
    status: string; // "PENDING" | "PREPARING" | "DELIVERING" | "COMPLETED" | "CANCELLED"
    paymentMethod: string;
    paymentStatus: string;
    deliveryTime?: string;
    notes?: string;
    cardContent?: string;
    cardSender?: string;
    createdAt: string;
    updatedAt: string;
    // 管理端额外字段
    itemCount?: number; // 商品数量
    addressText?: string; // 配送地址
    items?: OrderItemDetail[]; // 订单项详情
    orderItems?: OrderItemDetail[]; // API sometimes returns this
}

export interface OrderItemDetail {
    id: number;
    productId: number;
    productName: string;
    productImage?: string;
    productPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface OrderFilters {
    current?: number;
    size?: number;
    status?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    keyword?: string | undefined;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PageResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
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
        const result = response.data.data;
        if (result && result.records) {
            result.records = result.records.map((order: any) => ({
                ...order,
                items: order.orderItems || order.items
            }));
        }
        return result;
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

        const result = response.data.data;
        if (result && result.records) {
            result.records = result.records.map((order: any) => ({
                ...order,
                items: order.orderItems || order.items
            }));
        }
        return result;
    },

    /**
     * 管理端：搜索订单（分页、筛选、排序）
     */
    searchOrders: async (filters: OrderFilters): Promise<PageResult<Order>> => {
        const response = await api.post('/orders/search', filters);
        const result = response.data.data;
        // Map orderItems to items for frontend compatibility
        if (result && result.records) {
            result.records = result.records.map((order: any) => ({
                ...order,
                items: order.orderItems || order.items
            }));
        }
        return result;
    },

    /**
     * 查询订单详情（包含配送地址和订单项）
     */
    getOrderDetail: async (id: number): Promise<Order> => {
        const response = await api.get(`/orders/${id}`);
        const order = response.data.data;
        // Map orderItems to items for frontend compatibility
        if (order) {
            order.items = order.orderItems || order.items;
        }
        return order;
    },

    /**
     * 确认订单
     */
    confirmOrder: async (id: number): Promise<Order> => {
        const response = await api.put(`/orders/${id}/confirm`);
        return response.data.data;
    },

    /**
     * 开始配送
     */
    startDelivery: async (id: number): Promise<Order> => {
        const response = await api.put(`/orders/${id}/deliver`);
        return response.data.data;
    },

    /**
     * 完成配送并收款
     */
    completeOrder: async (id: number): Promise<Order> => {
        const response = await api.put(`/orders/${id}/complete`);
        return response.data.data;
    },

    /**
     * 取消订单
     */
    cancelOrder: async (id: number, reason?: string): Promise<Order> => {
        const response = await api.put(`/orders/${id}/cancel`, reason ? { reason } : {});
        return response.data.data;
    },
};
