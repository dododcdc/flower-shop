/**
 * Product model types and Zod validation schemas for the flower shop application
 * Matches the backend Product entity structure
 */

import { z } from 'zod';

// ====== Zod Validation Schemas ======

export const productSearchSchema = z.object({
  keyword: z.string().optional(),
  categoryId: z.number().positive().optional(),
  status: z.union([z.literal(0), z.literal(1)]).optional(),
  featured: z.union([z.literal(0), z.literal(1)]).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
  sortBy: z.enum(['created_at', 'price', 'name', 'stock_quantity', 'sales']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  current: z.number().min(1).default(1),
  size: z.number().min(1).default(12),
});

export const productFormSchema = z.object({
  name: z.string().min(1, '商品名称不能为空').max(100, '商品名称不能超过100个字符'),
  description: z.string().optional(),
  price: z.number().min(0.01, '价格必须大于0'),
  originalPrice: z.number().min(0).optional(),
  images: z.array(z.instanceof(File)).optional(),
  flowerLanguage: z.string().optional(),
  careGuide: z.string().optional(),
  categoryId: z.number().positive('请选择商品分类'),
  specification: z.string().optional(),
  status: z.union([z.literal(0), z.literal(1)]).default(1),
  featured: z.union([z.literal(0), z.literal(1)]).default(0),
  stockQuantity: z.number().min(0, '库存数量不能小于0').default(0),
  lowStockThreshold: z.number().min(0, '库存预警阈值不能小于0').default(5),
}).refine(
  (data) => {
    if (data.originalPrice === undefined) return true;
    return data.price <= data.originalPrice;
  },
  {
    message: '售价不能高于原价',
    path: ['price'],
  }
);

export const productUpdateSchema = productFormSchema.partial().extend({
  id: z.number().positive('商品ID必须大于0'),
});

// ====== TypeScript Types (derived from Zod schemas) ======

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images?: any; // 旧字段，兼容性保留，可能是JSON字符串或对象数组
  imageList?: string[]; // 新的图片列表
  mainImagePath?: string; // 主图路径
  flowerLanguage?: string;
  careGuide?: string;
  categoryId: number;
  categoryName?: string; // from category join
  specification?: string;
  status: 0 | 1; // 0-下架，1-上架
  featured: 0 | 1; // 0-不推荐，1-推荐
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductFormData = z.infer<typeof productFormSchema>;
export type ProductUpdateData = z.infer<typeof productUpdateSchema>;
export type ProductFilters = z.infer<typeof productSearchSchema>;

export interface ProductApiResponse {
  records: Product[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ProductImage {
  url: string;
  file: File;
  preview?: string;
}

export interface ProductImages {
  main?: string;
  subImages: string[];
}

// ====== Utility Functions ======

// Stock status utilities
export const getStockStatus = (product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' => {
  if (product.stockQuantity <= 0) return 'out_of_stock';
  if (product.stockQuantity <= product.lowStockThreshold) return 'low_stock';
  return 'in_stock';
};

export const getStockStatusText = (product: Product): string => {
  const status = getStockStatus(product);
  switch (status) {
    case 'in_stock': return '库存充足';
    case 'low_stock': return '库存不足';
    case 'out_of_stock': return '缺货';
    default: return '未知';
  }
};

export const getStockStatusColor = (product: Product): 'success' | 'warning' | 'error' | 'default' => {
  const status = getStockStatus(product);
  switch (status) {
    case 'in_stock': return 'success';
    case 'low_stock': return 'warning';
    case 'out_of_stock': return 'error';
    default: return 'error'; // Fallback to error or handle appropriately, but 'default' is not in type
  }
};

export const hasDiscount = (product: Product): boolean => {
  return product.originalPrice != null && product.originalPrice > product.price;
};

export const getDiscountPercentage = (product: Product): number => {
  if (!hasDiscount(product)) return 0;
  return Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100);
};

// Status helpers
export const getProductStatusText = (status: 0 | 1): string => {
  return status === 1 ? '上架' : '下架';
};

export const getFeaturedText = (featured: 0 | 1): string => {
  return featured === 1 ? '推荐' : '普通';
};

export const getProductStatusColor = (status: 0 | 1): 'success' | 'error' => {
  return status === 1 ? 'success' : 'error';
};

// Image utilities
export const parseImagesJson = (imagesJson: string): string[] => {
  try {
    return JSON.parse(imagesJson || '[]');
  } catch {
    return [];
  }
};

export const imagesToJson = (images: string[]): string => {
  return JSON.stringify(images);
};

// New: Parse ProductImages structure
export const parseProductImages = (imagesJson: string): ProductImages => {
  try {
    if (!imagesJson || imagesJson.trim() === '') {
      return { subImages: [] };
    }

    const parsed = JSON.parse(imagesJson);

    // Check if it's already the new format with main and subImages
    if (parsed && typeof parsed === 'object' && ('main' in parsed || 'subImages' in parsed)) {
      return {
        main: parsed.main || undefined,
        subImages: parsed.subImages || []
      };
    }

    // Try to parse as array (legacy format)
    if (Array.isArray(parsed)) {
      if (parsed.length > 0) {
        return {
          main: parsed[0],
          subImages: parsed.slice(1)
        };
      } else {
        return { subImages: [] };
      }
    }

    return { subImages: [] };
  } catch (error) {
    console.warn('Failed to parse product images JSON:', imagesJson, error);
    return { subImages: [] };
  }
};

// Convert ProductImages to JSON string
export const productImagesToJson = (productImages: ProductImages): string => {
  return JSON.stringify(productImages);
};

// Get all images (main + subImages)
export const getAllProductImages = (productImages: ProductImages): string[] => {
  const allImages: string[] = [];
  if (productImages.main) {
    allImages.push(productImages.main);
  }
  allImages.push(...productImages.subImages);
  return allImages;
};

// Get main image or fallback to first image
export const getMainProductImage = (imagesJson: string): string | undefined => {
  const productImages = parseProductImages(imagesJson);
  return productImages.main || productImages.subImages[0];
};

// Default form values
export const getDefaultProductFormData = (): ProductFormData => ({
  name: '',
  description: '',
  price: 0,
  originalPrice: undefined,
  images: [],
  flowerLanguage: '',
  careGuide: '',
  categoryId: 0,
  specification: '',
  status: 1,
  featured: 0,
  stockQuantity: 0,
  lowStockThreshold: 5,
});

// Form helper functions
export const prepareProductFormData = (product?: Partial<Product>): ProductFormData => {
  const defaultData = getDefaultProductFormData();

  if (!product) return defaultData;

  return {
    ...defaultData,
    name: product.name || '',
    description: product.description || '',
    price: product.price || 0,
    originalPrice: product.originalPrice,
    images: [], // Images are handled separately
    flowerLanguage: product.flowerLanguage || '',
    careGuide: product.careGuide || '',
    categoryId: product.categoryId || 0,
    specification: product.specification || '',
    status: product.status ?? 1,
    featured: product.featured ?? 0,
    stockQuantity: product.stockQuantity || 0,
    lowStockThreshold: product.lowStockThreshold || 5,
  };
};

// Validation helpers
export const validateProductForm = (data: unknown): {
  success: boolean;
  data?: ProductFormData;
  errors?: Record<string, string>;
} => {
  const result = productFormSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // Transform Zod errors to a more friendly format
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return {
    success: false,
    errors,
  };
};