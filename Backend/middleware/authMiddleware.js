// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
// Optional: only fetch user when you need deeper checks
// const User = require("../models/User");

function unauthorized(res, msg = "Not authorized") {
  return res.status(401).json({ success: false, message: msg });
}

exports.protect = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return unauthorized(res);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach minimal identity to request
    req.user = { id: decoded.id, role: decoded.role || "user" };

    // If you need full doc occasionally (uncomment when needed):
    // req.userDoc = await User.findById(decoded.id).select("-password");

    return next();
  } catch {
    return unauthorized(res, "Token invalid or expired");
  }
};

// Role guards
exports.adminOnly = (req, res, next) => {
  if (!req.user) return unauthorized(res);
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  return next();
};

// Generic role guard if you need more than admin/user later
exports.requireRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return unauthorized(res);
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient role" });
    }
    return next();
  };
