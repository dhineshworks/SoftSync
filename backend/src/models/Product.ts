import mongoose, { Schema, type InferSchemaType } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, default: null, min: 0 },
    imageUrl: { type: String, default: null },
    stockStatus: { type: String, enum: ["in_stock", "out_of_stock"], default: "in_stock" },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    const obj = ret as Record<string, unknown>;
    obj.id = String(obj._id);
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

export type ProductDocument = InferSchemaType<typeof productSchema> & { _id: mongoose.Types.ObjectId };

export const Product = mongoose.model("Product", productSchema);
