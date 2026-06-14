import { Router } from "express";
import { z } from "zod";
import { Product } from "../models/Product";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth";
import { serializeProduct } from "../utils/serialize";
import { slugify } from "../utils/slugify";

export const productsRouter = Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const ids = typeof req.query.ids === "string" ? req.query.ids.split(",").filter(Boolean) : [];
    const filter = ids.length > 0 ? { _id: { $in: ids } } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products.map((p) => serializeProduct(p.toJSON())));
  } catch (err) {
    next(err);
  }
});

productsRouter.get("/featured", async (_req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(8);
    res.json(products.map((p) => serializeProduct(p.toJSON())));
  } catch (err) {
    next(err);
  }
});

productsRouter.get("/slug/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(serializeProduct(product.toJSON()));
  } catch (err) {
    next(err);
  }
});

const productBodySchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().optional(),
  category: z.string().trim().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  offer_price: z.number().min(0).nullable().optional(),
  image_url: z.string().nullable().optional(),
  stock_status: z.enum(["in_stock", "out_of_stock"]).optional(),
  is_featured: z.boolean().optional(),
});

productsRouter.post("/", requireAuth, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const body = productBodySchema.parse(req.body);
    const slug = body.slug?.trim() || slugify(body.name);
    const product = await Product.create({
      name: body.name,
      slug,
      category: body.category,
      description: body.description ?? "",
      price: body.price,
      offerPrice: body.offer_price ?? null,
      imageUrl: body.image_url ?? null,
      stockStatus: body.stock_status ?? "in_stock",
      isFeatured: body.is_featured ?? false,
    });
    res.status(201).json(serializeProduct(product.toJSON()));
  } catch (err) {
    next(err);
  }
});

productsRouter.put("/:id", requireAuth, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const body = productBodySchema.partial().parse(req.body);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.offer_price !== undefined && { offerPrice: body.offer_price }),
        ...(body.image_url !== undefined && { imageUrl: body.image_url }),
        ...(body.stock_status !== undefined && { stockStatus: body.stock_status }),
        ...(body.is_featured !== undefined && { isFeatured: body.is_featured }),
      },
      { new: true },
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(serializeProduct(product.toJSON()));
  } catch (err) {
    next(err);
  }
});

productsRouter.delete("/:id", requireAuth, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
