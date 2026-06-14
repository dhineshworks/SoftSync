import mongoose, { Schema, type InferSchemaType } from "mongoose";

const orderItemSchema = new Schema(
  {
    id: String,
    name: String,
    slug: String,
    price: Number,
    quantity: Number,
    image_url: String,
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    items: { type: [orderItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "contacted", "completed", "cancelled"],
      default: "pending",
    },
    notes: { type: String, default: null },
  },
  { timestamps: true },
);

orderSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    const obj = ret as Record<string, unknown>;
    return {
      id: String(obj._id),
      user_id: obj.userId ? String(obj.userId) : null,
      customer_name: obj.customerName,
      email: obj.email,
      phone: obj.phone,
      items: obj.items,
      total: obj.total,
      status: obj.status,
      notes: obj.notes ?? null,
      created_at: obj.createdAt,
    };
  },
});

export type OrderDocument = InferSchemaType<typeof orderSchema> & { _id: mongoose.Types.ObjectId };

export const Order = mongoose.model("Order", orderSchema);
