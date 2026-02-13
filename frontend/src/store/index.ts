import { create } from 'zustand';

interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setIsLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token) set({ token });
      if (user) set({ user: JSON.parse(user) });
    }
  },
}));

interface ComparisonState {
  selectedVehicles: number[];
  addVehicle: (id: number) => void;
  removeVehicle: (id: number) => void;
  clearComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  selectedVehicles: [],

  addVehicle: (id) =>
    set((state) => ({
      selectedVehicles: state.selectedVehicles.length < 3 ? [...state.selectedVehicles, id] : state.selectedVehicles,
    })),

  removeVehicle: (id) =>
    set((state) => ({
      selectedVehicles: state.selectedVehicles.filter((vid) => vid !== id),
    })),

  clearComparison: () => set({ selectedVehicles: [] }),
}));

interface WishlistState {
  items: number[];
  addItem: (id: number) => void;
  removeItem: (id: number) => void;
  isInWishlist: (id: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  addItem: (id) =>
    set((state) => ({
      items: state.items.includes(id) ? state.items : [...state.items, id],
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((itemId) => itemId !== id),
    })),

  isInWishlist: (id) => get().items.includes(id),
}));
