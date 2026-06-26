import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../db/connect.js";
import { User } from "../models/User.js";

async function main() {
  await connectDb();

  const emails = ["businessowner1@gmail.com", "businessowner2@gmail.com", "business@test.com"];

  for (const email of emails) {
    const user = await User.findOne({ email });
    if (user) {
      user.role = "business";
      user.credits = 20;
      await user.save();
      console.log(`[update] Updated ${email} to business role with 20 credits`);
    } else {
      console.log(`[update] User ${email} not found`);
    }
  }

  await mongoose.disconnect();
  console.log("[update] Done");
}

main().catch(console.error);
