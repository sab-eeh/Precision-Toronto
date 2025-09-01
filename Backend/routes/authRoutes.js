// routes/authRoutes.js
const express = require("express");
const { registerAdmin, loginAdmin } = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Create admin (first time only, then disable)
// Later you can comment/remove this route
router.post("/register", registerAdmin);

// Admin login
router.post("/login", loginAdmin);

// Example protected route (only for admins)
router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard 🚀", admin: req.user });
});

module.exports = router;
