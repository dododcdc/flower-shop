import { productAPI, type ProductFormData, type ProductUpdateData } from '../api/productAPI';
import type { Product } from '../models/product';

/**
 * 获取单个商品
 */
export async function fetchProduct(id: number | null | undefined): Promise<Product | null> {
  if (!id) return null;
  return await productAPI.getProductById(id);
}

/**
 * 创建商品
 */
export async function createProduct({
  formData,
  mainImageIndex
}: {
  formData: ProductFormData;
  mainImageIndex?: number;
}): Promise<Product> {
  return await productAPI.createProduct(formData, mainImageIndex);
}

/**
 * 更新商品
 */
export async function updateProduct({
  id,
  productData,
  updateRequest
}: {
  id: number;
  productData: ProductUpdateData;
  updateRequest: {
    existingImages?: Array<{
      id: number;
      imagePath: string;
      imageType: number;
      sortOrder: number;
      isDeleted: boolean;
    }>;
    newImages?: Array<{
      imageType: number;
      sortOrder: number;
    }>;
    imageFiles?: File[];
  };
}): Promise<Product> {
  return await productAPI.updateProductWithImagesState(id, productData, updateRequest);
}

/**
 * 删除商品
 */
export async function deleteProduct(id: number): Promise<void> {
  await productAPI.deleteProduct(id);
}

/**
 * 切换商品状态
 */
export async function toggleProductStatus({ id, status }: { id: number; status: 0 | 1 }): Promise<void> {
  await productAPI.toggleProductStatus(id, status);
}

/**
 * 设置商品推荐状态
 */
export async function setProductFeatured({ id, featured }: { id: number; featured: 0 | 1 }): Promise<void> {
  await productAPI.setProductFeatured(id, featured);
}
