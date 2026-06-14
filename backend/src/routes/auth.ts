import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { serializeUser } from "../utils/serialize.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  full_name: z.string().trim().min(2).max(80),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: body.email });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const password = await bcrypt.hash(body.password, 12);
    const user = await User.create({
      email: body.email,
      password,
      fullName: body.full_name,
      role: "user",
    });

    const token = signToken({ sub: String(user._id), email: user.email, role: user.role });
    res.status(201).json({ token, user: serializeUser(user.toJSON()) });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ email: body.email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken({ sub: String(user._id), email: user.email, role: user.role });
    res.json({ token, user: serializeUser(user.toJSON()) });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: serializeUser(user.toJSON()) });
  } catch (err) {
    next(err);
  }
});
