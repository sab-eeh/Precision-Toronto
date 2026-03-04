/**
 * EXPRESS APPLICATION CONFIGURATION
 * Handles middleware, routes, security, and global error handling
 */

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

// Routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const contactRoutes = require("./routes/contactRoutes");
const smsRoutes = require("./routes/smsRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// Trust proxy (important for Render/Vercel deployments)
app.set("trust proxy", 1);

// ========================================
// SECURITY MIDDLEWARE
// ========================================

app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ========================================
// PERFORMANCE
// ========================================

app.use(compression());

// ========================================
// BODY PARSING
// ========================================

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://precisiontoronto.com",
  "https://www.precisiontoronto.com",
  "https://precision-toronto.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (origin.includes("precisiontoronto.com")) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ CORS blocked:", origin);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ========================================
// LOGGING
// ========================================

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// ========================================
// RATE LIMITING
// ========================================

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  })
);

// ========================================
// HEALTH CHECK
// ========================================

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Precision Toronto API is running",
  });
});

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/sms", smsRoutes);

// Prevent caching for chat messages
app.use("/api/messages", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/api/messages", messageRoutes);

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((err, _req, res, _next) => {
  console.error("❌ Server Error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

module.exports = app;
