const express = require("express");
const {
  login,
  forgotPassword,
  resetPassword,
  dashboard,
  registerAdminIfFirst,
  updateAdminCredentials,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/update-admin", updateAdminCredentials);
router.post("/register-admin" , registerAdminIfFirst)

router.get("/dashboard", protect, adminOnly, dashboard);

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many attempts. Try again later.",
});

router.post("/login", loginLimiter, login);

module.exports = router;
