const express = require("express");
const {
  createBooking,
  listBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getAvailability,
  deleteBooking,
} = require("../controllers/bookingController");
const validateRequest = require("../middleware/validateRequest");
const auth = require("../middleware/authMiddleware");
const { body, param, query } = require("express-validator");

const router = express.Router();

const bookingCreateValidators = [
  body("customerInfo.name").isString().trim().isLength({ min: 2 }),
  body("customerInfo.phone").isString().trim().isLength({ min: 6 }),
  body("selectedServices").isArray({ min: 1 }),
  body("totalPrice").isFloat({ min: 0 }),
  body("startAt").isISO8601().toDate(),
];

// Public
router.get(
  "/availability",
  [
    // Accept YYYY-MM-DD; isISO8601 works with that string.
    query("date").isISO8601().withMessage("date must be YYYY-MM-DD"),
    // Allow long, multi-day services
    query("durationMinutes").optional().isInt({ min: 1, max: 100000 }),
  ],
  validateRequest,
  getAvailability
);

router.post("/", bookingCreateValidators, validateRequest, createBooking);

// Admin
router.get("/", auth.protect, auth.adminOnly, listBookings);
router.get(
  "/:id",
  auth.protect,
  auth.adminOnly,
  param("id").isMongoId(),
  validateRequest,
  getBooking
);
router.put(
  "/:id",
  auth.protect,
  auth.adminOnly,
  param("id").isMongoId(),
  validateRequest,
  updateBooking
);
router.post(
  "/:id/cancel",
  auth.protect,
  auth.adminOnly,
  param("id").isMongoId(),
  validateRequest,
  cancelBooking
);
router.delete(
  "/:id",
  auth.protect,
  auth.adminOnly,
  param("id").isMongoId(),
  validateRequest,
  deleteBooking
);

module.exports = router;
