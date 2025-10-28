// backend/src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Generate reset token (returns raw token for email)
userSchema.methods.getResetPasswordToken = function () {
  const raw = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  return raw;
};

module.exports = mongoose.model("User", userSchema);
