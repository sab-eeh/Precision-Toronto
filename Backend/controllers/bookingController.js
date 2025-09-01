// controllers/bookingController.js
const Booking = require("../models/Booking");
const { addMinutes, generateSlotsForDay, isOverlap } = require("../utils/time");

/**
 * Compute duration
 */
function computeDurationMinutes(services = [], fallbackDurationMinutes = 60) {
  const sum = services.reduce(
    (acc, s) => acc + (Number(s.durationMinutes) || 0),
    0
  );
  return sum > 0 ? sum : fallbackDurationMinutes;
}

/**
 * POST /api/bookings
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

    // Overlap check
    const overlapping = await Booking.findOne({
      status: { $ne: "cancelled" },
      $expr: {
        $and: [
          { $lt: ["$startAt", end] },
          { $gt: ["$endAt", start] },
        ],
      },
    }).lean();

    if (overlapping) {
      return res.status(409).json({
        message: "Selected time overlaps with an existing booking. Please pick another time.",
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

    return res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings
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
 * PUT /api/bookings/:id
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
      if (!existing) return res.status(404).json({ message: "Booking not found" });

      const minutes =
        Number(durationMinutes) ||
        computeDurationMinutes(existing.services, 60);

      const end = addMinutes(start, minutes);

      const overlap = await Booking.findOne({
        _id: { $ne: existing._id },
        status: { $ne: "cancelled" },
        $expr: {
          $and: [
            { $lt: ["$startAt", end] },
            { $gt: ["$endAt", start] },
          ],
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
 * DELETE /api/bookings/:id
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
 * GET /api/bookings/availability
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
        isOverlap(s, sEnd, b.startAt, b.endAt)
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
};
