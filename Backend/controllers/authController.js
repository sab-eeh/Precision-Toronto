// controllers/authController.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });

exports.registerAdminIfFirst = async (req, res) => {
  // optional helper to create initial admin - protect this route in production
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User exists" });
  const user = await User.create({ name, email, password, role: "admin" });
  res.json({ message: "Admin created", userId: user._id });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Please provide email and password" });

  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, expiresIn: process.env.JWT_EXPIRES || "7d", user: { id: user._id, email: user.email, role: user.role } });
};

exports.dashboard = async (req, res) => {
  // protected route example
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  res.json({ admin: { id: user._id, email: user.email, name: user.name } });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const admin = await User.findOne({ email, role: "admin" });
  if (!admin) return res.status(404).json({ message: "No admin with that email" });

  const resetToken = admin.getResetPasswordToken();
  await admin.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/admin/reset-password/${resetToken}`; // raw token used in URL
  const message = `You requested a password reset. Click the link to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;

  try {
    await sendEmail({
      to: admin.email,
      subject: "Admin Password Reset",
      text: message,
    });
    res.json({ message: "Reset email sent" });
  } catch (err) {
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save({ validateBeforeSave: false });
    console.error("sendEmail error:", err);
    res.status(500).json({ message: "Email could not be sent" });
  }
};

exports.resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const admin = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!admin) return res.status(400).json({ message: "Invalid or expired token" });

  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  admin.password = password;
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpire = undefined;
  await admin.save();

  const token = signToken(admin);
  res.json({ message: "Password reset successful", token });
};
