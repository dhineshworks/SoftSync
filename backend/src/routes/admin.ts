import { Router } from "express";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/stats", async (_req, res, next) => {
  try {
    const [products, orders] = await Promise.all([
      Product.find().select("isFeatured"),
      Order.find().select("total status createdAt"),
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
      recent: orders
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map((o) => o.toJSON()),
    });
  } catch (err) {
    next(err);
  }
});
