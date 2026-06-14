/** Map MongoDB documents to API shape expected by the frontend (snake_case fields). */
export function serializeProduct(doc: Record<string, unknown>) {
  return {
    id: String(doc.id ?? doc._id),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    description: doc.description ?? "",
    price: doc.price,
    offer_price: doc.offerPrice ?? null,
    image_url: doc.imageUrl ?? null,
    stock_status: doc.stockStatus ?? "in_stock",
    is_featured: !!doc.isFeatured,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
  };
}

export function serializeUser(doc: Record<string, unknown>) {
  return {
    id: String(doc.id ?? doc._id),
    email: doc.email,
    full_name: doc.fullName ?? "",
    phone: doc.phone ?? "",
    role: doc.role,
  };
}
