import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../db/connect.js";
import { User } from "../models/User.js";

async function main() {
  await connectDb();
  const users = await User.find();
  console.log("Users in Database:");
  console.log(users.map(u => ({ id: u._id, email: u.email, role: u.role, credits: u.credits })));
  await mongoose.disconnect();
}

main().catch(console.error);
