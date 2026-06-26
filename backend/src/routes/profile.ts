import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { serializeUser } from "../utils/serialize.js";

export const profileRouter = Router();

profileRouter.use(requireAuth);

const updateSchema = z.object({
  full_name: z.string().trim().min(0).max(80).optional(),
  phone: z.string().trim().max(20).optional(),
});

profileRouter.get("/", async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(serializeUser(user.toJSON()));
  } catch (err) {
    next(err);
  }
});

profileRouter.put("/", async (req: AuthRequest, res, next) => {
  try {
    const body = updateSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      {
        ...(body.full_name !== undefined && { fullName: body.full_name }),
        ...(body.phone !== undefined && { phone: body.phone }),
      },
      { new: true },
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(serializeUser(user.toJSON()));
  } catch (err) {
    next(err);
  }
});

profileRouter.post("/buy-credits", async (req: AuthRequest, res, next) => {
  try {
    const buySchema = z.object({
      credits: z.number().int().positive(),
    });
    const { credits } = buySchema.parse(req.body);

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "business") {
      return res.status(400).json({ error: "Only business accounts can buy credits" });
    }

    user.credits = (user.credits ?? 0) + credits;
    await user.save();

    res.json({
      success: true,
      message: `Successfully purchased ${credits} credits.`,
      user: serializeUser(user.toJSON()),
    });
  } catch (err) {
    next(err);
  }
});

