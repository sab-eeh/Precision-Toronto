// backend/src/controllers/authController.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/emails");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });

/**
 * Create first admin manually (should be disabled after first use)
 */
exports.registerAdminIfFirst = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role: "admin" });
    res.json({ success: true, message: "Admin created", userId: user._id });
  } catch (err) {
    console.error("registerAdmin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin/User login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      success: true,
      token,
      expiresIn: process.env.JWT_EXPIRES || "7d",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Protected dashboard (admin only)
 */
exports.dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.json({ success: true, admin: user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Forgot password (admin)
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin)
      return res.status(404).json({ message: "No admin with that email" });

    const resetToken = admin.getResetPasswordToken();
    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/admin/reset-password/${resetToken}`;
    const html = `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, ignore this email.</p>`;

    const sent = await sendEmail(admin.email, "Admin Password Reset", html);
    if (!sent) throw new Error("Email not sent");

    res.json({ success: true, message: "Reset email sent" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: "Email could not be sent" });
  }
};

/**
 * Reset password
 */
exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const admin = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!admin)
      return res.status(400).json({ message: "Invalid or expired token" });

    const { password } = req.body;
    if (!password || password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save();

    const token = signToken(admin);
    res.json({ success: true, message: "Password reset successful", token });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
