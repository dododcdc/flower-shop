/**
 * Product API functions for the flower shop application
 * Integrates with backend ProductController endpoints
 */

import axiosClient from './axiosClient';
import {
  type Product,
  type ProductFormData,
  type ProductFilters,
  type ProductApiResponse,
  productSearchSchema,
  validateProductForm,
} from '../models/product';

// API Endpoints
const ENDPOINTS = {
  PRODUCTS: '/products',
  PAGE: '/products/page',
  SEARCH: '/products/search',
} as const;

// Response type for API calls
type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

/**
 * Search products with advanced filtering
 */
export const searchProducts = async (filters: ProductFilters): Promise<ProductApiResponse> => {
  // Validate and ensure required fields for search
  const searchParams = productSearchSchema.parse({
    current: 1,
    size: 12,
    ...filters,
  });

  const response = await axiosClient.post<ApiResponse<ProductApiResponse>>(ENDPOINTS.SEARCH, searchParams);

  return response.data.data;
};

/**
 * Get product by ID
 */
export const getProductById = async (id: number): Promise<Product> => {
  const response = await axiosClient.get<ApiResponse<Product>>(`${ENDPOINTS.PRODUCTS}/${id}`);
  return response.data.data;
};

/**
 * Create new product (必须包含图片)
 */
export const createProduct = async (
  formData: ProductFormData,
  mainImageIndex?: number
): Promise<Product> => {
  // Validate form data with Zod
  const validatedData = validateProductForm(formData);
  if (!validatedData.success) {
    throw new Error(`表单验证失败: ${Object.values(validatedData.errors || {}).join(', ')}`);
  }

  // 检查是否提供了图片
  if (!validatedData.data.images || validatedData.data.images.length === 0) {
    throw new Error('创建商品必须至少上传一张图片');
  }

  // Create FormData for multipart request (images)
  const formDataToSend = new FormData();

  // Create product data object (without images)
  const productData = { ...validatedData.data };
  delete productData.images;

  // Add product as JSON string
  formDataToSend.append('product', JSON.stringify(productData));

  // Add images (required parameter now)
  validatedData.data.images.forEach((file) => {
    formDataToSend.append('images', file); // 使用相同的名'images'，Spring会自动收集为数组
  });

  // Add main image index (必需参数)
  if (mainImageIndex === undefined || mainImageIndex < 0) {
    throw new Error('创建商品必须指定主图索引');
  }
  formDataToSend.append('mainImageIndex', String(mainImageIndex));

  const response = await axiosClient.post<ApiResponse<Product>>(ENDPOINTS.PRODUCTS, formDataToSend, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Update product with images (支持新的图片管理系统)
 */
export const updateProductWithImagesState = async (
  id: number,
  productData: any,
  updateRequest: {
    existingImages?: Array<{
      id: number;
      imagePath: string;
      imageType: number;    // 1-主图, 2-副图
      sortOrder: number;
      isDeleted: boolean;
    }>;
    newImages?: Array<{
      imageType: number;    // 1-主图, 2-副图
      sortOrder: number;
    }>;
    imageFiles?: File[];
  }
): Promise<Product> => {
  const formDataToSend = new FormData();

  // Add product data as JSON string
  formDataToSend.append('product', JSON.stringify(productData));

  // Add existing images info if provided
  if (updateRequest.existingImages && updateRequest.existingImages.length > 0) {
    formDataToSend.append('existingImages', JSON.stringify(updateRequest.existingImages));
  }

  // Add new images info if provided
  if (updateRequest.newImages && updateRequest.newImages.length > 0) {
    formDataToSend.append('newImages', JSON.stringify(updateRequest.newImages));
  }

  // Add image files if provided
  if (updateRequest.imageFiles && updateRequest.imageFiles.length > 0) {
    updateRequest.imageFiles.forEach((file: File, index: number) => {
      formDataToSend.append('imageFiles', file);
    });
  }

  const response = await axiosClient.put<ApiResponse<Product>>(`${ENDPOINTS.PRODUCTS}/${id}`, formDataToSend, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Delete product
 */
export const deleteProduct = async (id: number): Promise<string> => {
  const response = await axiosClient.delete<ApiResponse<string>>(`${ENDPOINTS.PRODUCTS}/${id}`);
  return response.data.message;
};

/**
 * Toggle product status (上架/下架)
 */
export const toggleProductStatus = async (id: number, status: 0 | 1): Promise<string> => {
  const response = await axiosClient.put<ApiResponse<string>>(`${ENDPOINTS.PRODUCTS}/${id}/status`, null, {
    params: { status },
  });
  return response.data.message;
};

/**
 * Set product featured status
 */
export const setProductFeatured = async (id: number, featured: 0 | 1): Promise<string> => {
  const response = await axiosClient.put<ApiResponse<string>>(`${ENDPOINTS.PRODUCTS}/${id}/featured`, null, {
    params: { featured },
  });
  return response.data.message;
};

// Export all API functions with error handling wrapper
export const productAPI = {
  searchProducts: (filters: ProductFilters) => searchProducts(filters),
  getProductById: (id: number) => getProductById(id),
  createProduct: (formData: ProductFormData, mainImageIndex?: number) => createProduct(formData, mainImageIndex),
  deleteProduct: (id: number) => deleteProduct(id),
  toggleProductStatus: (id: number, status: 0 | 1) => toggleProductStatus(id, status),
  setProductFeatured: (id: number, featured: 0 | 1) => setProductFeatured(id, featured),
  updateProductWithImagesState: (id: number, productData: any, imageFiles?: File[], imagesToDelete?: string[]) => updateProductWithImagesState(id, productData, imageFiles, imagesToDelete),
};

export default productAPI;