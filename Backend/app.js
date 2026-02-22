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

// Trust proxy (Render / Vercel / Nginx)
app.set("trust proxy", 1);

// ======================
// SECURITY MIDDLEWARE
// ======================

app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());

// ======================
// BODY PARSING
// ======================

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ======================
// CORS CONFIG (PRODUCTION SAFE)
// ======================

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("🌐 Origin:", origin);

      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        if (!allowed) return false;

        // Allow subdomains + variations
        return origin.startsWith(allowed.replace(/\/$/, ""));
      });

      if (isAllowed) return callback(null, true);

      console.error("❌ CORS blocked:", origin);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);



// ======================
// LOGGING
// ======================

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// ======================
// RATE LIMITING
// ======================

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, try again later.",
    },
  })
);

// ======================
// HEALTH CHECK
// ======================

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 API is running",
  });
});

// ======================
// ROUTES
// ======================

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);

// ======================
// 404 HANDLER
// ======================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ======================
// GLOBAL ERROR HANDLER
// ======================

app.use((err, _req, res, _next) => {
  console.error("❌ Error:", err.message);

  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

module.exports = app;
