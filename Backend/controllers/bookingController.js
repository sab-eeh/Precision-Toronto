// controllers/bookingController.js
const Booking = require("../models/Booking");
const { addMinutes, generateSlotsForDay, isOverlap } = require("../utils/time");
const sendEmail = require("../utils/emails");
const sendSMS = require("../utils/sms");

/**
 * Helper: compute duration in minutes from services (fallback default)
 */
function computeDurationMinutes(services = [], fallbackDurationMinutes = 60) {
  const sum = services.reduce(
    (acc, s) => acc + (Number(s.durationMinutes) || 0),
    0
  );
  return sum > 0 ? sum : fallbackDurationMinutes;
}

/**
 * Public: create booking (POST /api/bookings)
 * - checks overlap
 * - creates booking with startAt/endAt
 * - sends customer + admin notifications if configured
 */
const createBooking = async (req, res, next) => {
  try {
    const {
      customerName,
      phone,
      email,
      vehicle = {},
      services = [],
      totalPrice,
      startAt,
      durationMinutes,
      notes,
      source = "web",
    } = req.body;

    const start = new Date(startAt);
    if (Number.isNaN(start.getTime())) {
      return res.status(422).json({ message: "Invalid startAt date" });
    }

    const minutes = computeDurationMinutes(
      services,
      Number(durationMinutes) || 60
    );
    const end = addMinutes(start, minutes);

    // Overlap check: bookings that overlap with [start, end)
    const overlapping = await Booking.findOne({
      status: { $ne: "cancelled" },
      $expr: {
        $and: [{ $lt: ["$startAt", end] }, { $gt: ["$endAt", start] }],
      },
    }).lean();

    if (overlapping) {
      return res.status(409).json({
        message:
          "Selected time overlaps with an existing booking. Please pick another time.",
      });
    }

    const booking = await Booking.create({
      customerName,
      phone,
      email,
      vehicle,
      services,
      totalPrice,
      startAt: start,
      endAt: end,
      notes,
      status: "pending",
      source,
    });

    // Format date string for messages (server timezone)
    const bookingDate = new Date(booking.startAt).toLocaleString();

    // Customer Email
    if (booking.email) {
      const emailHtml = `
        <h2>Booking Confirmation</h2>
        <p>Dear ${booking.customerName},</p>
        <p>Your booking has been received successfully.</p>
        <p><strong>Service(s):</strong> ${booking.services
          .map((s) => s.title)
          .join(", ")}</p>
        <p><strong>Date & Time:</strong> ${bookingDate}</p>
        <p><strong>Total:</strong> $${booking.totalPrice}</p>
        <p>We look forward to serving you!</p>
      `;
      try {
        await sendEmail(booking.email, "Your Booking Confirmation", emailHtml);
      } catch (err) {
        // Log & continue — don't fail the booking if notification fails
        console.error("Customer email send error:", err);
      }
    }

    // Customer SMS
    if (booking.phone) {
      const smsText = `Hi ${booking.customerName}, your booking is confirmed on ${bookingDate}. - Precision Toronto`;
      try {
        await sendSMS(booking.phone, smsText);
      } catch (err) {
        console.error("Customer SMS send error:", err);
      }
    }

    // Admin Email
    try {
      const adminEmailHtml = `
        <h2>New Booking Received</h2>
        <p><strong>Name:</strong> ${booking.customerName}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Email:</strong> ${booking.email || "N/A"}</p>
        <p><strong>Service(s):</strong> ${booking.services
          .map((s) => s.title)
          .join(", ")}</p>
        <p><strong>Date & Time:</strong> ${bookingDate}</p>
        <p><strong>Total:</strong> $${booking.totalPrice}</p>
        <p><strong>Notes:</strong> ${booking.notes || "N/A"}</p>
      `;
      if (process.env.ADMIN_EMAIL) {
        await sendEmail(process.env.ADMIN_EMAIL, "📩 New Booking Alert", adminEmailHtml);
      }
    } catch (err) {
      console.error("Admin email send error:", err);
    }

    // Admin SMS
    if (process.env.ADMIN_PHONE) {
      try {
        const adminSms = `📢 New Booking: ${booking.customerName}, ${booking.phone}, ${booking.services
          .map((s) => s.title)
          .join(", ")} on ${bookingDate}.`;
        await sendSMS(process.env.ADMIN_PHONE, adminSms);
      } catch (err) {
        console.error("Admin SMS send error:", err);
      }
    }

    return res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings (admin) - list with pagination/filter
 */
const listBookings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      dateFrom,
      dateTo,
      sort = "-startAt",
    } = req.query;

    const q = {};
    if (status) q.status = status;
    if (dateFrom || dateTo) {
      q.startAt = {};
      if (dateFrom) q.startAt.$gte = new Date(dateFrom);
      if (dateTo) q.startAt.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Booking.find(q).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Booking.countDocuments(q),
    ]);

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      items,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/:id
 */
const getBooking = async (req, res, next) => {
  try {
    const doc = await Booking.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Booking not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/bookings/:id  (admin) - update fields and optionally move time
 */
const updateBooking = async (req, res, next) => {
  try {
    const { status, notes, startAt, durationMinutes } = req.body;

    const update = {};
    if (typeof status === "string") update.status = status;
    if (typeof notes === "string") update.notes = notes;

    if (startAt) {
      const start = new Date(startAt);
      if (Number.isNaN(start.getTime())) {
        return res.status(422).json({ message: "Invalid startAt date" });
      }

      const existing = await Booking.findById(req.params.id);
      if (!existing)
        return res.status(404).json({ message: "Booking not found" });

      const minutes =
        Number(durationMinutes) ||
        computeDurationMinutes(existing.services, 60);

      const end = addMinutes(start, minutes);

      const overlap = await Booking.findOne({
        _id: { $ne: existing._id },
        status: { $ne: "cancelled" },
        $expr: {
          $and: [{ $lt: ["$startAt", end] }, { $gt: ["$endAt", start] }],
        },
      }).lean();

      if (overlap) {
        return res.status(409).json({
          message: "New time overlaps with another booking.",
        });
      }

      update.startAt = start;
      update.endAt = end;
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking updated", booking: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/bookings/:id/approve  (admin)
 */
const approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "approved";
    await booking.save();

    res.json({ message: "Booking approved", booking });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/bookings/:id  (admin) - hard delete
 */
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "Booking deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/:id/cancel  - mark cancelled
 */
const cancelBooking = async (req, res, next) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "cancelled" } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking cancelled", booking: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/availability?date=YYYY-MM-DD
 */
const getAvailability = async (req, res, next) => {
  try {
    const {
      date,
      slotMinutes = 30,
      businessStart = process.env.BUSINESS_START || "09:00",
      businessEnd = process.env.BUSINESS_END || "18:00",
    } = req.query;

    if (!date) {
      return res.status(422).json({ message: "Missing 'date' (YYYY-MM-DD)" });
    }

    const dayUTC = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(dayUTC.getTime())) {
      return res.status(422).json({ message: "Invalid date format" });
    }

    const nextDayUTC = new Date(dayUTC.getTime() + 24 * 60 * 60 * 1000);

    const existing = await Booking.find({
      status: { $ne: "cancelled" },
      startAt: { $lt: nextDayUTC },
      endAt: { $gt: dayUTC },
    })
      .select("startAt endAt status")
      .lean();

    const slots = generateSlotsForDay(
      dayUTC,
      String(businessStart),
      String(businessEnd),
      Number(slotMinutes)
    );

    const availability = slots.map((s) => {
      const sEnd = new Date(s.getTime() + Number(slotMinutes) * 60000);
      const blocked = existing.some((b) =>
        isOverlap(s, sEnd, new Date(b.startAt), new Date(b.endAt))
      );
      return {
        startAt: s.toISOString(),
        endAt: sEnd.toISOString(),
        available: !blocked,
      };
    });

    res.json({
      date,
      slotMinutes: Number(slotMinutes),
      businessStart,
      businessEnd,
      availability,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getAvailability,
  getAllBookings: listBookings, // alias if you need it
  approveBooking,
  deleteBooking,
};
