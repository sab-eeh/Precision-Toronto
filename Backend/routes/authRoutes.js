const express = require("express");
const { registerAdmin, loginAdmin } = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard 🚀", admin: req.user });
});

module.exports = router;
