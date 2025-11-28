import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../models/product';

export interface CartItem {
  id: string; // 购物车项目ID，不是商品ID
  productId: number;
  product: Product;
  quantity: number;
  addedAt: Date;
  selected?: boolean; // 用于结算时的选择状态
}

export interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;

  // Actions
  addItem: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: (selected: boolean) => void;
  getSelectedItems: () => CartItem[];
  getTotalSelectedPrice: () => number;
  getTotalSelectedItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isOpen: false,

      addItem: (product: Product, quantity = 1) => {
        const state = get();
        const existingItemIndex = state.items.findIndex(
          (item) => item.productId === product.id
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // 如果商品已存在，更新数量
          const existingItem = state.items[existingItemIndex]!;
          const newQuantity = existingItem.quantity + quantity;

          // 检查库存
          if (newQuantity > product.stockQuantity) {
            return { success: false, message: `库存不足！当前库存：${product.stockQuantity}件` };
          }

          newItems = state.items.map((item, index) => {
            if (index === existingItemIndex) {
              return {
                ...item,
                quantity: newQuantity,
                selected: true, // 新添加或更新的商品默认选中
              };
            }
            return item;
          });
        } else {
          // 如果商品不存在，添加新商品
          if (quantity > product.stockQuantity) {
            return { success: false, message: `库存不足！当前库存：${product.stockQuantity}件` };
          }

          const newItem: CartItem = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productId: product.id,
            product,
            quantity,
            addedAt: new Date(),
            selected: true, // 新添加的商品默认选中
          };
          newItems = [...state.items, newItem];
        }

        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        set({
          items: newItems,
          totalItems,
          totalPrice,
        });

        return { success: true };
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          return {
            items: newItems,
            totalItems,
            totalPrice,
          };
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) => {
            if (item.id === itemId) {
              if (quantity > item.product.stockQuantity) {
                alert(`库存不足！当前库存：${item.product.stockQuantity}件`);
                return item;
              }
              return { ...item, quantity };
            }
            return item;
          });

          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          return {
            items: newItems,
            totalItems,
            totalPrice,
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleItemSelection: (itemId: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
          ),
        }));
      },

      selectAllItems: (selected: boolean) => {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, selected })),
        }));
      },

      getSelectedItems: () => {
        return get().items.filter((item) => item.selected);
      },

      getTotalSelectedPrice: () => {
        return get()
          .items.filter((item) => item.selected)
          .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getTotalSelectedItems: () => {
        return get()
          .items.filter((item) => item.selected)
          .reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'flower-cart-storage',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
);