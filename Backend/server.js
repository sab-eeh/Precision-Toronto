const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db.js");

// Load environment variables
dotenv.config();

// Connect to DB
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(morgan("dev"));

// Rate Limiter (protects API from abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window per IP
});
app.use(limiter);

// Routes
// const authRoutes = require("./routes/authRoutes.js");
// const bookingRoutes = require("./routes/bookingRoutes.js");
// const serviceRoutes = require("./routes/serviceRoutes.js");

// app.use("/api/auth", authRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/services", serviceRoutes);

// Error handler (catch all)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something went wrong!" });
// });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
