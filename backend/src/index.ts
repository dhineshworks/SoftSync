import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { connectDb } from "./db/connect.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { uploadRouter } from "./routes/upload.js";
import { adminRouter } from "./routes/admin.js";

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

  // Serve frontend static assets in production
  if (env.nodeEnv === "production") {
    const frontendDistPath = path.join(__dirname, "../../frontend/dist");
    app.use(express.static(frontendDistPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
      }
      res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
        if (err) {
          res.status(404).send("Frontend build not found. Please run build first.");
        }
      });
    });
  }

  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`[api] SoftSync backend running on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
