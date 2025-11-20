import create from 'zustand';

type User = {
  id?: number;
  username?: string;
  role?: string;
  email?: string;
  phone?: string;
  lastLogin?: string;
};

type State = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error?: string;
  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
};

export const useAuthStore = create<State>((set) => ({
  token: null,
  user: null,
  loading: false,
  error: undefined,
  setToken: (t) => set({ token: t }),
  setUser: (u) => set({ user: u }),
}));
