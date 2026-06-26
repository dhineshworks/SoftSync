import { Router } from "express";
import { z } from "zod";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { requireAuth, requireAdmin, requireAdminOrBusiness, type AuthRequest } from "../middleware/auth.js";
import { serializeProduct } from "../utils/serialize.js";
import { slugify } from "../utils/slugify.js";

export const productsRouter = Router();

productsRouter.get("/my", requireAuth, requireAdminOrBusiness, async (req: AuthRequest, res, next) => {
  try {
    const filter = req.user!.role === "admin" ? {} : { ownerId: req.user!.id };
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products.map((p) => serializeProduct(p.toJSON())));
  } catch (err) {
    next(err);
  }
});

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

productsRouter.post("/", requireAuth, requireAdminOrBusiness, async (req: AuthRequest, res, next) => {
  try {
    const body = productBodySchema.parse(req.body);
    const slug = body.slug?.trim() || slugify(body.name);

    let ownerId = null;

    if (req.user!.role === "business") {
      const user = await User.findById(req.user!.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      if ((user.credits ?? 0) < 1) {
        return res.status(403).json({ error: "Insufficient credits to add products. Please purchase more." });
      }

      user.credits = (user.credits ?? 0) - 1;
      await user.save();
      ownerId = user._id;
    }

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
      ownerId,
    });
    res.status(201).json(serializeProduct(product.toJSON()));
  } catch (err) {
    next(err);
  }
});

productsRouter.put("/:id", requireAuth, requireAdminOrBusiness, async (req: AuthRequest, res, next) => {
  try {
    const body = productBodySchema.partial().parse(req.body);
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    if (req.user!.role === "business" && existing.ownerId?.toString() !== req.user!.id) {
      return res.status(403).json({ error: "Access denied: You can only edit your own products." });
    }

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
    res.json(serializeProduct(product!.toJSON()));
  } catch (err) {
    next(err);
  }
});

productsRouter.delete("/:id", requireAuth, requireAdminOrBusiness, async (req: AuthRequest, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    if (req.user!.role === "business" && existing.ownerId?.toString() !== req.user!.id) {
      return res.status(403).json({ error: "Access denied: You can only delete your own products." });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
