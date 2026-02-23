const express = require("express");
const {
  login,
  forgotPassword,
  resetPassword,
  dashboard,
  registerAdminIfFirst,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.get("/dashboard", protect, adminOnly, dashboard);

// 🔥 REMOVE AFTER FIRST USE
router.post("/register-admin", registerAdminIfFirst);

module.exports = router;