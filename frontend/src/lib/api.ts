const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const TOKEN_KEY = "softsync_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export type ApiUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "user" | "business" | "admin";
  credits?: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  price: number;
  offer_price: number | null;
  image_url: string | null;
  stock_status: string;
  is_featured?: boolean;
  owner_id?: string | null;
};

export type Order = {
  id: string;
  user_id?: string;
  customer_name: string;
  email: string;
  phone: string;
  items: Array<{ id: string; name: string; quantity: number; price: number; slug?: string; image_url?: string | null }>;
  total: number;
  status: string;
  notes?: string | null;
  created_at: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
  return data as T;
}

export const api = {
  register: (body: { email: string; password: string; full_name: string; role: string }) =>
    request<{ token: string; user: ApiUser }>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: ApiUser }>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => request<{ user: ApiUser }>("/api/auth/me"),

  getProfile: () => request<ApiUser>("/api/profile"),
  updateProfile: (body: { full_name?: string; phone?: string }) =>
    request<ApiUser>("/api/profile", { method: "PUT", body: JSON.stringify(body) }),

  getProducts: (ids?: string[]) => {
    const q = ids?.length ? `?ids=${ids.join(",")}` : "";
    return request<Product[]>(`/api/products${q}`);
  },
  getMyProducts: () => request<Product[]>("/api/products/my"),
  getFeaturedProducts: () => request<Product[]>("/api/products/featured"),
  getProductBySlug: (slug: string) => request<Product>(`/api/products/slug/${slug}`),
  createProduct: (body: Record<string, unknown>) =>
    request<Product>("/api/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id: string, body: Record<string, unknown>) =>
    request<Product>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id: string) => request<{ ok: boolean }>(`/api/products/${id}`, { method: "DELETE" }),

  createOrder: (body: Record<string, unknown>) =>
    request<Order>("/api/orders", { method: "POST", body: JSON.stringify(body) }),
  getMyOrders: () => request<Order[]>("/api/orders/me"),
  getAllOrders: () => request<Order[]>("/api/orders"),
  updateOrderStatus: (id: string, status: string) =>
    request<Order>(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  getAdminStats: () =>
    request<{
      productCount: number;
      featured: number;
      orderCount: number;
      pending: number;
      totalRevenue: number;
      recent: Order[];
      businessCount?: number;
    }>("/api/admin/stats"),

  getAdminUsers: () => request<ApiUser[]>("/api/admin/users"),
  updateAdminUser: (id: string, body: { role?: string; credits?: number; fullName?: string; phone?: string }) =>
    request<ApiUser>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteAdminUser: (id: string) => request<{ ok: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" }),

  buyCredits: (credits: number) =>
    request<{ success: boolean; user: ApiUser }>("/api/profile/buy-credits", { method: "POST", body: JSON.stringify({ credits }) }),

  uploadImage: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ url: string }>("/api/upload", { method: "POST", body: form });
  },
};
