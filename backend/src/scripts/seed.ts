import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Product } from "../models/Product";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");

  await mongoose.connect(uri);

  const email = process.env.ADMIN_EMAIL ?? "admin@softsync.com";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const fullName = process.env.ADMIN_NAME ?? "SoftSync Admin";

  const hash = await bcrypt.hash(password, 12);
  const admin = await User.findOneAndUpdate(
    { email },
    { email, password: hash, fullName, role: "admin" },
    { upsert: true, new: true },
  );
  console.log(`[seed] Admin user: ${admin.email}`);

  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      {
        name: "Canva Pro",
        slug: "canva-pro",
        category: "Design",
        description: "Premium design templates and brand kit.",
        price: 4999,
        offerPrice: 2499,
        stockStatus: "in_stock",
        isFeatured: true,
        imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
      },
      {
        name: "ChatGPT Plus",
        slug: "chatgpt-plus",
        category: "AI Tools",
        description: "Faster responses and priority access.",
        price: 1999,
        offerPrice: 999,
        stockStatus: "in_stock",
        isFeatured: true,
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      },
    ]);
    console.log("[seed] Sample products created");
  }

  await mongoose.disconnect();
  console.log("[seed] Done");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
