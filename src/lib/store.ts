import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemType {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
  variant: { id: string; size?: string; color?: string; stock: number } | null;
  stock: number;
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  addresses: Array<{ id: string; name: string; phone: string; address: string; city: string; district: string; isDefault: boolean }>;
}

interface AppState {
  // Navigation
  currentPage: string;
  pageParams: Record<string, string>;
  navigate: (page: string, params?: Record<string, string>) => void;

  // Cart
  cartItems: CartItemType[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (item: CartItemType) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  // Auth
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isAdmin: () => boolean;

  // UI
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  lastOrderNumber: string | null;
  setLastOrderNumber: (num: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentPage: 'home',
      pageParams: {},
      navigate: (page, params = {}) => {
        set({ currentPage: page, pageParams: params });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      // Cart
      cartItems: [],
      cartCount: 0,
      cartSubtotal: 0,
      addToCart: (item) => {
        const items = [...get().cartItems];
        const existingIdx = items.findIndex(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        if (existingIdx >= 0) {
          items[existingIdx] = {
            ...items[existingIdx],
            quantity: items[existingIdx].quantity + item.quantity,
          };
        } else {
          items.push(item);
        }
        const count = items.reduce((s, i) => s + i.quantity, 0);
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        set({ cartItems: items, cartCount: count, cartSubtotal: subtotal, cartDrawerOpen: true });
      },
      updateCartQuantity: (id, quantity) => {
        let items = [...get().cartItems];
        if (quantity <= 0) {
          items = items.filter((i) => i.id !== id);
        } else {
          items = items.map((i) => (i.id === id ? { ...i, quantity } : i));
        }
        const count = items.reduce((s, i) => s + i.quantity, 0);
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        set({ cartItems: items, cartCount: count, cartSubtotal: subtotal });
      },
      removeFromCart: (id) => {
        const items = get().cartItems.filter((i) => i.id !== id);
        const count = items.reduce((s, i) => s + i.quantity, 0);
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        set({ cartItems: items, cartCount: count, cartSubtotal: subtotal });
      },
      clearCart: () => set({ cartItems: [], cartCount: 0, cartSubtotal: 0 }),

      // Auth
      user: null,
      setUser: (user) => set({ user }),
      isAdmin: () => get().user?.role === 'admin',

      // UI
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      cartDrawerOpen: false,
      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
      lastOrderNumber: null,
      setLastOrderNumber: (num) => set({ lastOrderNumber: num }),
    }),
    {
      name: 'roshni-store',
      partialize: (state) => ({
        cartItems: state.cartItems,
        cartCount: state.cartCount,
        cartSubtotal: state.cartSubtotal,
        user: state.user,
        lastOrderNumber: state.lastOrderNumber,
      }),
    }
  )
);