import { create } from "zustand";
import { persist } from "zustand/middleware";

// --- Order lifecycle states ---

export type OrderPhase =
  | "browsing"
  | "cart"
  | "delivery"
  | "recipient"
  | "review"
  | "creating"
  | "checkout"
  | "tracking";

// --- Data types ---

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
  icingText?: string;
}

export interface DeliveryInfo {
  city: string;
  address: string;
  locationType: "house" | "apartment" | "office" | "other";
  date: string;
  instructions?: string;
  rate?: number;
  available?: boolean;
}

export interface RecipientInfo {
  name: string;
  phone: string;
}

export interface SenderInfo {
  name: string;
  anonymous: boolean;
}

export interface OrderResult {
  checkoutUrl: string;
  orderRef: string;
  grandTotal: number;
  currency: string;
  expiresAt: string;
}


// --- Settings ---

export interface AppSettings {
  language: "en" | "si" | "ta";
  currency: "LKR" | "USD";
  theme: "light" | "dark";
}

// --- Shopping Store ---

interface ShoppingState {
  phase: OrderPhase;
  setPhase: (phase: OrderPhase) => void;

  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  delivery: DeliveryInfo | null;
  setDelivery: (info: DeliveryInfo) => void;

  recipient: RecipientInfo | null;
  setRecipient: (info: RecipientInfo) => void;

  sender: SenderInfo | null;
  setSender: (info: SenderInfo) => void;

  giftMessage: string;
  setGiftMessage: (msg: string) => void;

  orderResult: OrderResult | null;
  setOrderResult: (result: OrderResult) => void;

  resetOrder: () => void;
}

const initialShoppingState = {
  phase: "browsing" as OrderPhase,
  cart: [] as CartItem[],
  delivery: null as DeliveryInfo | null,
  recipient: null as RecipientInfo | null,
  sender: null as SenderInfo | null,
  giftMessage: "",
  orderResult: null as OrderResult | null,
};

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set) => ({
      ...initialShoppingState,

      setPhase: (phase) => set({ phase }),

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((c) => c.productId === item.productId);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.productId === item.productId
                  ? { ...c, quantity: c.quantity + item.quantity }
                  : c
              ),
              phase: "cart",
            };
          }
          return { cart: [...state.cart, item], phase: "cart" };
        }),

      removeFromCart: (productId) =>
        set((state) => {
          const cart = state.cart.filter((c) => c.productId !== productId);
          return { cart, phase: cart.length === 0 ? "browsing" : "cart" };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            c.productId === productId
              ? { ...c, quantity: Math.min(99, Math.max(1, quantity)) }
              : c
          ),
        })),

      clearCart: () => set({ cart: [], phase: "browsing" }),

      setDelivery: (delivery) => set({ delivery, phase: "delivery" }),

      setRecipient: (recipient) => set({ recipient, phase: "recipient" }),

      setSender: (sender) => set({ sender }),

      setGiftMessage: (giftMessage) => set({ giftMessage: giftMessage.slice(0, 300) }),

      setOrderResult: (orderResult) => set({ orderResult, phase: "checkout" }),

      resetOrder: () => set(initialShoppingState),
    }),
    {
      name: "kapruka-shopping-state",
      partialize: (state) => ({
        cart: state.cart,
        delivery: state.delivery,
        recipient: state.recipient,
        sender: state.sender,
        giftMessage: state.giftMessage,
        phase: state.phase,
      }),
    }
  )
);


// --- Pending Order Store ---

export interface PendingOrderItem {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
  total: number;
}

export interface PendingOrder {
  id: string;
  items: PendingOrderItem[];
  recipient: { name: string; phone: string };
  delivery: {
    city: string;
    address: string;
    locationType: string;
    date: string;
    instructions?: string;
  };
  sender: { name: string };
  giftMessage?: string;
  chatMessageId?: string;
}

interface PendingOrderState {
  pendingOrder: PendingOrder | null;
  setPendingOrder: (order: PendingOrder) => void;
  clearPendingOrder: () => void;
}

export const usePendingOrderStore = create<PendingOrderState>()(
  persist(
    (set) => ({
      pendingOrder: null,
      setPendingOrder: (order) => set({ pendingOrder: order }),
      clearPendingOrder: () => set({ pendingOrder: null }),
    }),
    {
      name: "kapruka-pending-order",
    }
  )
);

// --- Settings Store ---

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: { language: "en", currency: "LKR", theme: "light" },
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: "kapruka-settings",
      partialize: (state) => ({ settings: state.settings, sidebarOpen: state.sidebarOpen }),
    }
  )
);
