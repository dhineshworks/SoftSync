import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

type StoreCtx = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isWished: (id: string) => boolean;
};

const Ctx = createContext<StoreCtx | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(read<CartItem[]>("cart", []));
    setWishlist(read<string[]>("wishlist", []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart: StoreCtx["addToCart"] = (item, qty = 1) =>
    setCart((c) => {
      const existing = c.find((x) => x.id === item.id);
      if (existing) return c.map((x) => (x.id === item.id ? { ...x, quantity: x.quantity + qty } : x));
      return [...c, { ...item, quantity: qty }];
    });

  const removeFromCart = (id: string) => setCart((c) => c.filter((x) => x.id !== id));
  const updateQty = (id: string, qty: number) =>
    setCart((c) => c.map((x) => (x.id === id ? { ...x, quantity: Math.max(1, qty) } : x)));
  const clearCart = () => setCart([]);

  const toggleWishlist = (id: string) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  const isWished = (id: string) => wishlist.includes(id);

  return (
    <Ctx.Provider value={{ cart, wishlist, addToCart, removeFromCart, updateQty, clearCart, toggleWishlist, isWished }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
};
