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
  ONLINE: '/products/online',
  FEATURED: '/products/featured',
  TOP_SELLING: '/products/top-selling',
  STATISTICS: '/products/statistics',
  LOW_STOCK: '/products/low-stock',
  CHECK_NAME: '/products/check-name',
  STOCK_CHECK: '/products',
} as const;

// Response type for API calls
type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

// ====== CRUD Operations ======

/**
 * Get products with pagination and filtering (for admin management)
 */
export const getProducts = async (filters: ProductFilters = {}): Promise<ProductApiResponse> => {
  // Validate filters with Zod schema
  const validatedFilters = productSearchSchema.parse(filters);

  const response = await axiosClient.get<ApiResponse<ProductApiResponse>>(ENDPOINTS.PAGE, {
    params: validatedFilters,
  });

  return response.data.data;
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
 * Create new product
 */
export const createProduct = async (formData: ProductFormData): Promise<Product> => {
  // Validate form data with Zod
  const validatedData = validateProductForm(formData);
  if (!validatedData.success) {
    throw new Error(`表单验证失败: ${Object.values(validatedData.errors || {}).join(', ')}`);
  }

  // Create FormData for multipart request (images)
  const formDataToSend = new FormData();

  // Add all fields except images
  Object.entries(validatedData.data).forEach(([key, value]) => {
    if (key !== 'images') {
      formDataToSend.append(key, String(value));
    }
  });

  // Add images
  if (validatedData.data.images && validatedData.data.images.length > 0) {
    validatedData.data.images.forEach((file, index) => {
      formDataToSend.append(`images[${index}]`, file);
    });
  }

  const response = await axiosClient.post<ApiResponse<Product>>(ENDPOINTS.PRODUCTS, formDataToSend, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Update existing product
 */
export const updateProduct = async (id: number, formData: ProductFormData): Promise<Product> => {
  // Validate form data with Zod
  const validatedData = validateProductForm(formData);
  if (!validatedData.success) {
    throw new Error(`表单验证失败: ${Object.values(validatedData.errors || {}).join(', ')}`);
  }

  // Create FormData for multipart request
  const formDataToSend = new FormData();

  // Add product data as JSON string
  const { images, ...productData } = validatedData.data;
  formDataToSend.append('product', JSON.stringify(productData));

  // Add images if provided
  if (images && images.length > 0) {
    images.forEach((file: File) => {
      formDataToSend.append('images', file);
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
 * Update product with images state (用于编辑时更新图片状态)
 */
export const updateProductWithImagesState = async (id: number, productData: any, imageFiles?: File[], imagesToDelete?: string[]): Promise<Product> => {
  const formDataToSend = new FormData();

  // Add product data as JSON string
  formDataToSend.append('product', JSON.stringify(productData));

  // Add image files if provided
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file: File) => {
      formDataToSend.append('images', file);
    });
  }

  // Add images to delete if provided
  if (imagesToDelete && imagesToDelete.length > 0) {
    formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
  }

  // Add new image main index if provided
  if (productData.newImageMainIndex !== null && productData.newImageMainIndex !== undefined) {
    formDataToSend.append('newImageMainIndex', productData.newImageMainIndex.toString());
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

// ====== Special Queries ======

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limit = 10): Promise<Product[]> => {
  const response = await axiosClient.get<ApiResponse<Product[]>>(ENDPOINTS.FEATURED, {
    params: { limit },
  });
  return response.data.data;
};

/**
 * Get top selling products
 */
export const getTopSellingProducts = async (limit = 10): Promise<Product[]> => {
  const response = await axiosClient.get<ApiResponse<Product[]>>(ENDPOINTS.TOP_SELLING, {
    params: { limit },
  });
  return response.data.data;
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  const response = await axiosClient.get<ApiResponse<Product[]>>(`${ENDPOINTS.PRODUCTS}/category/${categoryId}`);
  return response.data.data;
};

/**
 * Get products by price range
 */
export const getProductsByPriceRange = async (minPrice: number, maxPrice: number): Promise<Product[]> => {
  const response = await axiosClient.get<ApiResponse<Product[]>>(ENDPOINTS.ONLINE, {
    params: {
      minPrice,
      maxPrice,
      current: 1,
      size: 50, // Get more results for price range
    },
  });
  return response.data.data.records;
};

/**
 * Check if product name already exists
 */
export const checkNameDuplicate = async (name: string, excludeId?: number): Promise<boolean> => {
  const response = await axiosClient.get<ApiResponse<boolean>>(ENDPOINTS.CHECK_NAME, {
    params: { name, excludeId },
  });
  return response.data.data;
};

/**
 * Check product stock availability
 */
export const checkStockAvailable = async (id: number, quantity: number): Promise<boolean> => {
  const response = await axiosClient.get<ApiResponse<boolean>>(`${ENDPOINTS.STOCK_CHECK}/${id}/stock-check`, {
    params: { quantity },
  });
  return response.data.data;
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (): Promise<Product[]> => {
  const response = await axiosClient.get<ApiResponse<Product[]>>(ENDPOINTS.LOW_STOCK);
  return response.data.data;
};

// ====== Batch Operations ======

/**
 * Get multiple products by IDs
 */
export const getProductsByIds = async (productIds: number[]): Promise<Product[]> => {
  const response = await axiosClient.post<ApiResponse<Product[]>>(`${ENDPOINTS.PRODUCTS}/batch`, productIds);
  return response.data.data;
};

/**
 * Batch update product status
 */
export const batchUpdateStatus = async (productIds: number[], status: 0 | 1): Promise<string> => {
  const response = await axiosClient.put<ApiResponse<string>>(ENDPOINTS.PRODUCTS + '/batch-status', null, {
    params: {
      productIds: productIds.join(','),
      status,
    },
  });
  return response.data.message;
};

// ====== Statistics ======

/**
 * Get product statistics
 */
export const getProductStatistics = async (): Promise<Record<string, any>> => {
  const response = await axiosClient.get<ApiResponse<Record<string, any>>>(ENDPOINTS.STATISTICS);
  return response.data.data;
};

// ====== Error Handling ======

export class ProductAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ProductAPIError';
  }
}

/**
 * Handle API errors consistently
 */
export const handleAPIError = (error: any): never => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || '请求失败';
    throw new ProductAPIError(message, status, data?.code);
  } else if (error.request) {
    throw new ProductAPIError('网络错误，请检查网络连接');
  } else {
    throw new ProductAPIError(error.message || '未知错误');
  }
};

// ====== Sample Data Creation ======

/**
 * Create sample products for testing
 */
export const createSampleProducts = async (): Promise<string> => {
  const response = await axiosClient.post<ApiResponse<string>>(ENDPOINTS.PRODUCTS + '/create-samples');
  return response.data.message;
};

/**
 * Set product main image
 */
export const setMainImage = async (productId: number, imagePath: string): Promise<string> => {
  const response = await axiosClient.put<ApiResponse<string>>(`${ENDPOINTS.PRODUCTS}/${productId}/main-image`, null, {
    params: { mainImagePath: imagePath },
  });
  return response.data.message;
};

/**
 * Remove product image
 */
export const removeProductImage = async (productId: number, imagePath: string): Promise<string> => {
  const response = await axiosClient.delete<ApiResponse<string>>(`${ENDPOINTS.PRODUCTS}/${productId}/images`, {
    params: { imagePath },
  });
  return response.data.message;
};

// Export all API functions with error handling wrapper
export const productAPI = {
  getProducts: (filters?: ProductFilters) => getProducts(filters).catch(handleAPIError),
  searchProducts: (filters: ProductFilters) => searchProducts(filters).catch(handleAPIError),
  getProductById: (id: number) => getProductById(id).catch(handleAPIError),
  createProduct: (formData: ProductFormData) => createProduct(formData).catch(handleAPIError),
  updateProduct: (id: number, formData: ProductFormData) => updateProduct(id, formData).catch(handleAPIError),
  deleteProduct: (id: number) => deleteProduct(id).catch(handleAPIError),
  toggleProductStatus: (id: number, status: 0 | 1) => toggleProductStatus(id, status).catch(handleAPIError),
  setProductFeatured: (id: number, featured: 0 | 1) => setProductFeatured(id, featured).catch(handleAPIError),
  getFeaturedProducts: (limit?: number) => getFeaturedProducts(limit).catch(handleAPIError),
  getTopSellingProducts: (limit?: number) => getTopSellingProducts(limit).catch(handleAPIError),
  getProductsByCategory: (categoryId: number) => getProductsByCategory(categoryId).catch(handleAPIError),
  getProductsByPriceRange: (minPrice: number, maxPrice: number) => getProductsByPriceRange(minPrice, maxPrice).catch(handleAPIError),
  checkNameDuplicate: (name: string, excludeId?: number) => checkNameDuplicate(name, excludeId).catch(handleAPIError),
  checkStockAvailable: (id: number, quantity: number) => checkStockAvailable(id, quantity).catch(handleAPIError),
  getLowStockProducts: () => getLowStockProducts().catch(handleAPIError),
  getProductsByIds: (productIds: number[]) => getProductsByIds(productIds).catch(handleAPIError),
  batchUpdateStatus: (productIds: number[], status: 0 | 1) => batchUpdateStatus(productIds, status).catch(handleAPIError),
  getProductStatistics: () => getProductStatistics().catch(handleAPIError),
  createSampleProducts: () => createSampleProducts().catch(handleAPIError),
  setMainImage: (productId: number, imagePath: string) => setMainImage(productId, imagePath).catch(handleAPIError),
  removeProductImage: (productId: number, imagePath: string) => removeProductImage(productId, imagePath).catch(handleAPIError),
  updateProductWithImagesState: (id: number, productData: any, imageFiles?: File[], imagesToDelete?: string[]) => updateProductWithImagesState(id, productData, imageFiles, imagesToDelete).catch(handleAPIError),
};

export default productAPI;