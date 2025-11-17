// API响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'CUSTOMER';
  lastLogin: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  role: string;
  email: string;
  phone: string;
  lastLogin: string;
}

export interface AdminInitRequest {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
}

// 商品相关类型
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  flowerLanguage: string;
  careGuide: string;
  categoryId: number;
  categoryName: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  type: 'FLOWER' | 'PACKAGING';
  sortOrder: number;
  isActive: boolean;
}

// 路由类型
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
}

// 购物车类型
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  totalPrice: number;
}

// 订单类型
export interface Order {
  id: number;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  deliveryFee: number;
  finalAmount: number;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: 'ALIPAY' | 'WECHAT' | 'CASH' | 'MOCK';
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  deliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productName: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface DeliveryAddress {
  province: string;
  city: string;
  district: string;
  streetAddress: string;
  postalCode?: string;
}