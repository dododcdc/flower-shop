import create from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id?: number;
  username?: string;
  role?: string; // ROLE_ADMIN or ROLE_CUSTOMER
  email?: string | null;
  phone?: string | null;
  lastLogin?: string | null;
};

type State = {
  token: string | null;
  user: User | null;
  guestId: string | null;
  loading: boolean;
  error?: string;
  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
  setGuestId: (id: string | null) => void;
  logout: () => void;
  isAdmin: () => boolean;
};

export const useAuthStore = create<State>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      guestId: null, // 新增：游客ID
      loading: false,
      error: undefined as string | undefined,
      setToken: (t) => set({ token: t }),
      setUser: (u) => set({ user: u }),
      setGuestId: (id) => set({ guestId: id }), // 新增：设置游客ID
      logout: () => set({ token: null, user: null }), // 注销时保留游客ID还是清空？通常注销后变回游客，这里暂不清空guestId以免弹窗重复跳
      isAdmin: () => get().user?.role === 'ROLE_ADMIN',
    }),
    {
      name: 'flower-auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, guestId: state.guestId }), // 持久化游客ID
    }
  )
);
