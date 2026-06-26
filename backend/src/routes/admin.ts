import { Router } from "express";
import { z } from "zod";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { serializeUser } from "../utils/serialize.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/stats", async (_req, res, next) => {
  try {
    const [products, orders, businessCount] = await Promise.all([
      Product.find().select("isFeatured"),
      Order.find().select("total status createdAt"),
      User.countDocuments({ role: "business" }),
    ]);
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    const featured = products.filter((p) => p.isFeatured).length;

    res.json({
      productCount: products.length,
      featured,
      orderCount: orders.length,
      pending,
      totalRevenue,
      businessCount,
      recent: orders
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map((o) => o.toJSON()),
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map((u) => serializeUser(u.toJSON())));
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/users/:id", async (req, res, next) => {
  try {
    const bodySchema = z.object({
      role: z.enum(["user", "business", "admin"]).optional(),
      credits: z.number().int().min(0).optional(),
      fullName: z.string().optional(),
      phone: z.string().optional(),
    });

    const parsed = bodySchema.parse(req.body);
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (parsed.role !== undefined) user.role = parsed.role;
    if (parsed.credits !== undefined) user.credits = parsed.credits;
    if (parsed.fullName !== undefined) user.fullName = parsed.fullName;
    if (parsed.phone !== undefined) user.phone = parsed.phone;

    await user.save();
    res.json(serializeUser(user.toJSON()));
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
