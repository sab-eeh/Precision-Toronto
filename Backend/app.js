// backend/src/app.js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

// Routes
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");


// Init app
const app = express();

// Trust reverse proxy (Heroku/Render/Nginx) so rate-limit & secure cookies work
app.set("trust proxy", 1);

// Basic hardening
app.use(
  helmet({
    // If you embed images/fonts/CDN during dev, relax CSP here or disable it
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);
app.use(compression());

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// CORS (allow local dev + env whitelist)
const allowed = new Set(
  ["http://localhost:5173", process.env.CLIENT_URL].filter(Boolean)
);
app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser tools (no origin)
      if (!origin || allowed.has(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Logs (quiet for tests)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Global rate limit for API
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, try again later." },
  })
);

// --- Routes ---
app.get("/", (_req, res) => {
  res.status(200).json({ message: "API is running ✅" });
});

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);


// 404
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Error handler (must be last)
app.use((err, _req, res, _next) => {
  if (process.env.NODE_ENV !== "test") {
    console.error("❌ Error:", err.stack || err);
  }
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
