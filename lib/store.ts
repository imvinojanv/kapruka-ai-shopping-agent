import { create } from "zustand";
import { persist } from "zustand/middleware";

// --- Order lifecycle states ---

export type OrderPhase =
  | "browsing"       // Searching/viewing products
  | "cart"           // Items selected, building cart
  | "delivery"       // Confirming delivery city/date
  | "recipient"      // Collecting recipient details
  | "review"         // Final review before order
  | "creating"       // Order being placed (loading)
  | "checkout"       // Checkout URL generated, awaiting payment
  | "tracking";      // Post-payment, tracking order

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

// --- Store shape ---

interface ShoppingState {
  // Order lifecycle
  phase: OrderPhase;
  setPhase: (phase: OrderPhase) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Delivery
  delivery: DeliveryInfo | null;
  setDelivery: (info: DeliveryInfo) => void;

  // Recipient
  recipient: RecipientInfo | null;
  setRecipient: (info: RecipientInfo) => void;

  // Sender
  sender: SenderInfo | null;
  setSender: (info: SenderInfo) => void;

  // Gift
  giftMessage: string;
  setGiftMessage: (msg: string) => void;

  // Order result
  orderResult: OrderResult | null;
  setOrderResult: (result: OrderResult) => void;

  // Reset
  resetOrder: () => void;
}

const initialState = {
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
      ...initialState,

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
            c.productId === productId ? { ...c, quantity: Math.min(99, Math.max(1, quantity)) } : c
          ),
        })),

      clearCart: () => set({ cart: [], phase: "browsing" }),

      setDelivery: (delivery) => set({ delivery, phase: "delivery" }),

      setRecipient: (recipient) => set({ recipient, phase: "recipient" }),

      setSender: (sender) => set({ sender }),

      setGiftMessage: (giftMessage) => set({ giftMessage: giftMessage.slice(0, 300) }),

      setOrderResult: (orderResult) => set({ orderResult, phase: "checkout" }),

      resetOrder: () => set(initialState),
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
