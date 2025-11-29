import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

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
    status: number;
    deliveryTime?: string;
    cardContent?: string;
    cardSender?: string;
    createdAt: string;
}

export const orderAPI = {
    /**
     * 创建订单
     */
    createOrder: async (request: CreateOrderRequest): Promise<Order> => {
        const response = await axios.post(`${API_BASE_URL}/orders`, request);
        return response.data.data;
    },
};
