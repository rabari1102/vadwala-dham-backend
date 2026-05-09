require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return cb(null, true);

      // Allow all Vercel preview & production deployments
      if (origin.endsWith(".vercel.app")) return cb(null, true);

      // Allow custom production domain
      if (origin === "https://dudhrejvadwala.com") return cb(null, true);
      if (origin === "https://www.dudhrejvadwala.com") return cb(null, true);

      // Allow localhost for local development
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        return cb(null, true);
      }

      // Allow any extra origins defined in env (comma-separated)
      const extras = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(",").map((s) => s.trim())
        : [];
      if (extras.includes(origin)) return cb(null, true);

      cb(new Error("CORS: origin not allowed - " + origin));
    },
    credentials: true,
  }),
);
// ─────────────────────────────────────────────────────────────────────────────

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
if (!isProduction) app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// MongoDB connection with caching for serverless
let cachedDb = null;
let connectionPromise = null;

const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vadwala_dham";
const mongoOptions = {
  serverSelectionTimeoutMS:
    Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
  socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 45000,
  maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || 10,
};

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

mongoose.connection.on("disconnected", () => {
  cachedDb = null;
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(mongoUri, mongoOptions)
    .then(() => {
      cachedDb = mongoose.connection;
      return cachedDb;
    })
    .catch((err) => {
      cachedDb = null;
      throw err;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
}

// Connect on every request (cached after first)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(503).json({
      error: "Database connection failed",
      message: isProduction ? "Please try again later" : err.message,
    });
  }
});

// Routes
app.use("/api/hero", require("../src/routes/hero"));
app.use("/api/announcements", require("../src/routes/announcements"));
app.use("/api/about", require("../src/routes/about"));
app.use("/api/acharyas", require("../src/routes/acharyas"));
app.use("/api/services", require("../src/routes/services"));
app.use("/api/festivals", require("../src/routes/festivals"));
app.use("/api/events", require("../src/routes/festivals"));
app.use("/api/gallery", require("../src/routes/gallery"));
app.use("/api/dhaja-chadava", require("../src/routes/dhajaChadava"));
app.use("/api/contact", require("../src/routes/contact"));
app.use("/api/donation", require("../src/routes/donation"));
app.use("/api/donations", require("../src/routes/donation"));
app.use("/api/content", require("../src/routes/content"));
app.use("/api/pages", require("../src/routes/pages"));
app.use("/api/media", require("../src/routes/media"));
app.use("/api/admin", require("../src/routes/admin"));

app.get("/api/health", (_, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);
app.get("/", (_, res) =>
  res.json({ message: "Vadwala Dham API is running", version: "1.0.0" }),
);

// ── SEED ENDPOINT ──────────────────────────────────────────────────────────────
app.get("/api/seed", async (req, res) => {
  const secret = process.env.SEED_SECRET || "vadwala2025";
  if (req.query.secret !== secret) {
    return res.status(403).json({ error: "Forbidden – wrong secret" });
  }
  try {
    const { importLiveSiteContent } = require("../src/services/liveSiteImporter");
    const result = await importLiveSiteContent({ reset: true, downloadImages: true });
    res.json({ ...result, message: "Database seeded with live Dudhrej Vadwala content." });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: err.message });
  }
});
// ── END SEED ENDPOINT ──────────────────────────────────────────────────────────

// For local dev only
if (!isProduction && require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().catch((err) => {
    console.error("Initial MongoDB connection failed:", err.message);
    console.error("Server will keep running and retry on the next request.");
  });

  const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`),
  );

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing server...`);
    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

module.exports = app;
