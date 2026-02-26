const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/emails");

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES || "7d",
    }
  );

/**
 * 🔐 LOGIN (SECURE)
 */

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await user.comparePassword(password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 ADMIN CHECK
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔐 HARD LOCK EMAIL
    if (user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateAdminCredentials = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ role: "admin" }).select("+password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (email) admin.email = email;
    if (password) admin.password = password; // will auto hash

    await admin.save();

    res.json({ success: true, message: "Admin updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * 🔒 DASHBOARD
 */
exports.dashboard = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔑 FORGOT PASSWORD
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
      return res.json({
        success: true,
        message: "If email exists, reset link sent",
      });
    }

    const resetToken = admin.getResetPasswordToken();
    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/admin/reset-password/${resetToken}`;

    const html = `
      <h2>Password Reset</h2>
      <p>Click below to reset:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    await sendEmail(admin.email, "Reset Password", html);

    res.json({ success: true, message: "Reset email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending email" });
  }
};

/**
 * 🔁 RESET PASSWORD
 */
exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const token = signToken(user);

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
