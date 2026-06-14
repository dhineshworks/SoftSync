import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    const { password, __v, ...safe } = ret as Record<string, unknown>;
    void password;
    void __v;
    safe.id = String(safe._id);
    delete safe._id;
    return safe;
  },
});

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const User = mongoose.model("User", userSchema);
