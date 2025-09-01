const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db.js");

// Start reminder scheduler
require("./utils/reminderScheduler");


// Load environment variables
dotenv.config();

// Connect to DB
connectDB();

// Init express app
const app = express();

// --------------------
// Middlewares
// --------------------
app.use(express.json({ limit: "10kb" })); // prevent large payload attacks
app.use(helmet()); // secure HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // allow frontend
    credentials: true,
  })
);
app.use(morgan("dev"));

// Rate Limiter (protects API from abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests/IP
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);
// Routes

// const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
// const serviceRoutes = require("./routes/serviceRoutes");

// console.log("authRoutes:", typeof authRoutes);
console.log("bookingRoutes:", typeof bookingRoutes);
// console.log("serviceRoutes:", typeof serviceRoutes);


// app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
// app.use("/api/services", serviceRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running ✅" });
});

// --------------------
// Global Error Handler
// --------------------
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
