// backend/src/routes/authRoutes.js
const express = require("express");
const {
  login,
  forgotPassword,
  resetPassword,
  dashboard,
  registerAdminIfFirst,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/dashboard", protect, dashboard);

// Only use once to create first admin
router.post("/register-admin", registerAdminIfFirst);

module.exports = router;
