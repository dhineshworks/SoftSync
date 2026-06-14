import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env";
import { connectDb } from "./db/connect";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { profileRouter } from "./routes/profile";
import { productsRouter } from "./routes/products";
import { ordersRouter } from "./routes/orders";
import { uploadRouter } from "./routes/upload";
import { adminRouter } from "./routes/admin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await connectDb();

  const app = express();

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "softsync-api" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api/admin", adminRouter);

  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`[api] SoftSync backend running on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
