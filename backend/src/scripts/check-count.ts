import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models/Product.js";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || "");
  const count = await Product.countDocuments();
  console.log("Product count in DB:", count);
  const products = await Product.find({});
  console.log("Products in DB:", products);
  await mongoose.disconnect();
}
main();
