import { Router } from "express";
import { z } from "zod";
import { Order } from "../models/Order.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.js";

export const ordersRouter = Router();

const orderSchema = z.object({
  customer_name: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().min(7),
  notes: z.string().trim().max(500).optional(),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string().optional(),
      price: z.number(),
      quantity: z.number().int().min(1),
      image_url: z.string().nullable().optional(),
    }),
  ),
  total: z.number().min(0),
});

ordersRouter.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const body = orderSchema.parse(req.body);
    const order = await Order.create({
      userId: req.user!.id,
      customerName: body.customer_name,
      email: body.email,
      phone: body.phone,
      notes: body.notes ?? null,
      items: body.items,
      total: body.total,
      status: "pending",
    });
    res.status(201).json(order.toJSON());
  } catch (err) {
    next(err);
  }
});

ordersRouter.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    res.json(orders.map((o) => o.toJSON()));
  } catch (err) {
    next(err);
  }
});

ordersRouter.get("/", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map((o) => o.toJSON()));
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch("/:id/status", requireAuth, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { status } = z
      .object({ status: z.enum(["pending", "contacted", "completed", "cancelled"]) })
      .parse(req.body);
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order.toJSON());
  } catch (err) {
    next(err);
  }
});
