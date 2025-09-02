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
const authMiddleware = require("../middleware/authMiddleware");
const { body, param } = require("express-validator");

const router = express.Router();

// Validators
const bookingCreateValidators = [
  body("customerInfo.name").isString().isLength({ min: 2 }),
  body("customerInfo.phone").isString().isLength({ min: 6 }),
  body("selectedServices").isArray({ min: 1 }),
  body("totalPrice").isFloat({ min: 0 }),
  body("startAt").isISO8601(),
];

// Public
router.post("/", bookingCreateValidators, validateRequest, createBooking);
router.get("/availability", getAvailability);

// Admin
router.get("/", authMiddleware.protect, authMiddleware.adminOnly, listBookings);
router.get(
  "/:id",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  param("id").isMongoId(),
  validateRequest,
  getBooking
);
router.put(
  "/:id",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  param("id").isMongoId(),
  validateRequest,
  updateBooking
);
router.post(
  "/:id/cancel",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  param("id").isMongoId(),
  validateRequest,
  cancelBooking
);
router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.adminOnly,
  param("id").isMongoId(),
  validateRequest,
  deleteBooking
);

module.exports = router;
