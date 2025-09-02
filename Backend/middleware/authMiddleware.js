// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    // optionally fetch full user:
    // req.userDoc = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });
  next();
};
