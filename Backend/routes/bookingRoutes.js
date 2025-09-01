// routes/bookingRoutes.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const { body, query, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const {
  createBooking,
  listBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getAvailability,
} = require("../controllers/bookingController");

const router = express.Router();

/**
 * Rate limiter for creation endpoints (to reduce abuse)
 */
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many booking attempts from this IP, please try again later.",
});

/**
 * Validators
 */
const bookingCreateValidators = [
  body("customerName").isString().trim().isLength({ min: 2, max: 120 }),
  body("phone").isString().trim().isLength({ min: 6, max: 30 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("services")
    .isArray({ min: 1 })
    .withMessage("At least one service is required"),
  body("services.*.title").isString().trim().isLength({ min: 2 }),
  body("services.*.price").isFloat({ min: 0 }).toFloat(),
  body("services.*.durationMinutes").optional().isInt({ min: 0 }).toInt(),
  body("totalPrice").isFloat({ min: 0 }).toFloat(),
  body("startAt").isISO8601().withMessage("startAt must be an ISO date string"),
  body("durationMinutes").optional().isInt({ min: 1, max: 24 * 60 }).toInt(),
  body("vehicle").optional().isObject(),
  body("notes").optional().isString().isLength({ max: 1000 }).trim().escape(),
];

const listValidators = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 200 }).toInt(),
  query("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled", "completed", "no_show"]),
  query("dateFrom").optional().isISO8601(),
  query("dateTo").optional().isISO8601(),
  query("sort").optional().isString(),
];

const idValidator = [param("id").isMongoId()];

const availabilityValidators = [
  query("date").isString().matches(/^\d{4}-\d{2}-\d{2}$/),
  query("slotMinutes").optional().isInt({ min: 10, max: 240 }).toInt(),
  query("businessStart").optional().matches(/^\d{2}:\d{2}$/),
  query("businessEnd").optional().matches(/^\d{2}:\d{2}$/),
];

/**
 * Routes
 */
router.get("/availability", availabilityValidators, validateRequest, getAvailability);
router.post("/", createLimiter, bookingCreateValidators, validateRequest, createBooking);
router.get("/", listValidators, validateRequest, listBookings);
router.get("/:id", idValidator, validateRequest, getBooking);
router.put("/:id", idValidator, validateRequest, updateBooking);
router.delete("/:id", idValidator, validateRequest, cancelBooking);

module.exports = router;
