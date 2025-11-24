import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, type ProductFilters, type ProductFormData, type ProductUpdateData } from '../api/productAPI';
import type { Product } from '../models/product';

// Query keys - 集中管理查询键
export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productQueryKeys.lists(), filters] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...productQueryKeys.details(), id] as const,
};

/**
 * 获取商品列表的 hook
 */
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: productQueryKeys.list(filters),
    queryFn: () => productAPI.searchProducts(filters),
    select: (data) => data, // 保持原有数据结构
  });
}

/**
 * 获取单个商品的 hook
 */
export function useProduct(id: number | null | undefined) {
  return useQuery({
    queryKey: productQueryKeys.detail(id!),
    queryFn: () => productAPI.getProductById(id!),
    enabled: !!id, // 只有当 id 存在时才查询
  });
}

/**
 * 创建商品的 mutation hook
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formData, mainImageIndex }: {
      formData: ProductFormData;
      mainImageIndex?: number
    }) => productAPI.createProduct(formData, mainImageIndex),
    onSuccess: () => {
      // 创建成功后，让商品列表重新获取数据
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists()
      });
    },
    onError: (error) => {
      console.error('创建商品失败:', error);
    },
  });
}

/**
 * 更新商品的 mutation hook
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
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
    }) => productAPI.updateProductWithImagesState(id, productData, updateRequest),
    onSuccess: (data, variables) => {
      // 更新成功后：
      // 1. 更新该商品的缓存数据
      queryClient.setQueryData(
        productQueryKeys.detail(variables.id),
        data
      );
      // 2. 让商品列表重新获取数据
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists()
      });
    },
    onError: (error) => {
      console.error('更新商品失败:', error);
    },
  });
}

/**
 * 删除商品的 mutation hook
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productAPI.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      // 删除成功后：
      // 1. 从缓存中移除该商品
      queryClient.removeQueries({
        queryKey: productQueryKeys.detail(deletedId)
      });
      // 2. 让商品列表重新获取数据
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists()
      });
    },
    onError: (error) => {
      console.error('删除商品失败:', error);
    },
  });
}

/**
 * 切换商品状态的 mutation hook
 */
export function useToggleProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 0 | 1 }) =>
      productAPI.toggleProductStatus(id, status),
    onSuccess: (_, variables) => {
      // 状态更新成功后，更新该商品的缓存
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(variables.id)
      });
      // 同时更新列表缓存
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists()
      });
    },
    onError: (error) => {
      console.error('切换商品状态失败:', error);
    },
  });
}

/**
 * 设置商品推荐状态的 mutation hook
 */
export function useSetProductFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: 0 | 1 }) =>
      productAPI.setProductFeatured(id, featured),
    onSuccess: (_, variables) => {
      // 推荐状态更新成功后，更新该商品的缓存
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.detail(variables.id)
      });
      // 同时更新列表缓存
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.lists()
      });
    },
    onError: (error) => {
      console.error('设置商品推荐状态失败:', error);
    },
  });
}