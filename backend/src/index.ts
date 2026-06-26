import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
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

  app.set("trust proxy", true);

  // Dynamically set apiPublicUrl in production if it is not configured (e.g., defaults to localhost)
  app.use((req, _res, next) => {
    if (env.apiPublicUrl.includes("localhost")) {
      const host = req.get("host");
      if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
        const proto = req.headers["x-forwarded-proto"] || req.protocol;
        const singleProto = Array.isArray(proto) ? proto[0] : proto.split(",")[0].trim();
        env.apiPublicUrl = `${singleProto}://${host}`;
        console.log(`[api] Dynamically updated env.apiPublicUrl to: ${env.apiPublicUrl}`);
      }
    }
    next();
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = [env.frontendUrl];
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "softsync-api" });
  });

  app.get("/api/debug-uploads", (_req, res) => {
    const dir = path.join(__dirname, "../uploads");
    const exists = fs.existsSync(dir);
    let files: string[] = [];
    if (exists) {
      files = fs.readdirSync(dir);
    }
    res.json({
      __dirname,
      resolvedPath: dir,
      exists,
      files,
    });
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
