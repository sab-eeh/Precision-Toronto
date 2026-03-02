const Booking = require("../models/Booking");
const {
  BUSINESS_START_HOUR,
  BUSINESS_END_HOUR,
  addBusinessMinutes,
  isOverlap,
  generateSlotsForDay,
  atHM,
} = require("../utils/time");
const { sendBookingNotifications } = require("../services/notificationService");
const { normalizePayload } = require("../utils/normalizePayload");

const MAX_DAY_MINUTES = (BUSINESS_END_HOUR - BUSINESS_START_HOUR) * 60;

/** Sum service+addon durations; use fallback if nothing selected */
function computeDurationMinutes(services = [], addons = [], fallback = 60) {
  const s = Array.isArray(services) ? services : [];
  const a = Array.isArray(addons) ? addons : [];
  const total =
    s.reduce((sum, it) => sum + (Number(it.durationMinutes) || 0), 0) +
    a.reduce((sum, it) => sum + (Number(it.durationMinutes) || 0), 0);
  return total > 0 ? total : fallback;
}

/**
 * Normalize booking payload.
 * IMPORTANT:
 * - Accepts both selectedServices/services
 * - Accepts both selectedAddons/addons
 */

async function createBooking(req, res) {
  try {
    const data = normalizePayload(req.body);

    if (!data.customerName || !data.phone) {
      return res
        .status(422)
        .json({ success: false, message: "Missing customer details" });
    }

    const start = new Date(data.startAt);
    if (isNaN(start.getTime())) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid startAt date" });
    }

    const durationMinutes = computeDurationMinutes(data.services, data.addons);
    const end = addBusinessMinutes(start, durationMinutes);
    const DURHAM_CITIES = [
      "Ajax",
      "Pickering",
      "Whitby",
      "Oshawa",
      "Clarington",
    ];

    let transportFee = 0;

    if (data.serviceType === "mobile" && data.city) {
      if (!DURHAM_CITIES.includes(data.city)) {
        transportFee = 25;
      }
    }
  
    const basePrice = Number(data.totalPrice || 0);
    const finalPrice = basePrice + transportFee;

    const overlapping = await Booking.findOne({
      status: { $ne: "cancelled" },
      $expr: { $and: [{ $lt: ["$startAt", end] }, { $gt: ["$endAt", start] }] },
    }).lean();

    if (data.serviceType === "mobile" && !data.city) {
      return res.status(422).json({
        success: false,
        message: "City is required for mobile service",
      });
    }

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message:
          "Selected time overlaps with an existing booking. Please choose a different time.",
      });
    }

    const booking = await Booking.create({
      ...data,

      totalPrice: finalPrice,
      transportFee,
      startAt: start,
      endAt: end,
      durationMinutes,
      status: "confirmed",
      source: "web",
    });

    notifyCustomer(booking).catch(console.error);
    notifyAdmin(booking).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Booking created",
      booking,
    });

    sendBookingNotifications(booking).catch((err) =>
      console.error("Async notification failed:", err.message)
    );
  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function listBookings(_req, res) {
  try {
    const bookings = await Booking.find().sort({ startAt: -1 }).lean();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("List bookings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    res.json({ success: true, booking });
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function updateBooking(req, res) {
  try {
    const raw = req.body || {};
    const normalized = normalizePayload(raw);

    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    const updates = {};

    if (raw.customerInfo || raw.customerName) {
      if (normalized.customerName)
        updates.customerName = normalized.customerName;
      if (normalized.phone) updates.phone = normalized.phone;
      if (normalized.email) updates.email = normalized.email;
      updates.address = normalized.address || booking.address;
    }

    if (raw.vehicleInfo || raw.vehicle) {
      updates.vehicle = {
        ...(booking.vehicle || {}),
        ...(normalized.vehicle || {}),
      };
    }
    if (raw.serviceType) {
      updates.serviceType =
        raw.serviceType === "mobile" || raw.serviceType === "dropoff"
          ? raw.serviceType
          : booking.serviceType;
    }

    if (raw.city !== undefined) {
      updates.city = raw.city || null;
    }

    // Accept services / selectedServices
    const hasServices =
      Array.isArray(raw.services) || Array.isArray(raw.selectedServices);
    const hasAddons =
      Array.isArray(raw.addons) || Array.isArray(raw.selectedAddons);

    if (hasServices) updates.services = normalized.services;
    if (hasAddons) updates.addons = normalized.addons;

    if (raw.notes !== undefined) updates.notes = raw.notes;

    if (raw.totalPrice !== undefined) {
      updates.totalPrice = Number(raw.totalPrice) || 0;
    }

    if (raw.startAt) {
      const newStart = new Date(raw.startAt);
      if (isNaN(newStart.getTime())) {
        return res
          .status(422)
          .json({ success: false, message: "Invalid startAt date" });
      }
      updates.startAt = newStart;
    }

    // If start/services/addons changed → recompute endAt & duration
    if (updates.startAt || hasServices || hasAddons) {
      const newStart = updates.startAt || booking.startAt;
      const durationMinutes = computeDurationMinutes(
        hasServices ? updates.services : booking.services,
        hasAddons ? updates.addons : booking.addons
      );

      const newEnd = addBusinessMinutes(newStart, durationMinutes);

      const overlapping = await Booking.findOne({
        _id: { $ne: booking._id },
        status: { $ne: "cancelled" },
        $expr: {
          $and: [{ $lt: ["$startAt", newEnd] }, { $gt: ["$endAt", newStart] }],
        },
      }).lean();

      if (overlapping) {
        return res.status(409).json({
          success: false,
          message:
            "Updated time overlaps with an existing booking. Please select a different time.",
        });
      }

      updates.endAt = newEnd;
      updates.durationMinutes = durationMinutes;
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      lean: true,
    });

    res.json({ success: true, message: "Booking updated", booking: updated });
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getAvailability(req, res) {
  try {
    const { date, durationMinutes } = req.query;
    if (!date) {
      return res.status(422).json({ success: false, message: "Missing ?date" });
    }

    const dayStart = new Date(date);
    if (isNaN(dayStart.getTime())) {
      return res.status(422).json({ success: false, message: "Invalid date" });
    }

    // Clamp duration (also covers undefined)
    const raw = Number(durationMinutes || 60);
    const serviceDuration = Math.max(1, Math.min(100000, Math.floor(raw)));

    const businessMinsPerDay = MAX_DAY_MINUTES;
    const neededDays = Math.ceil(serviceDuration / businessMinsPerDay);
    const lookaheadDays = Math.min(neededDays + 3, 30);

    const horizonStart = atHM(dayStart, BUSINESS_START_HOUR);
    const horizonEnd = new Date(horizonStart);
    horizonEnd.setDate(horizonEnd.getDate() + lookaheadDays);

    const bookings = await Booking.find({
      status: { $ne: "cancelled" },
      startAt: { $lt: horizonEnd },
      endAt: { $gt: horizonStart },
    }).lean();

    const now = new Date();
    const slots = generateSlotsForDay(dayStart, {
      startHour: BUSINESS_START_HOUR,
      endHour: BUSINESS_END_HOUR,
      slotMinutes: 60,
    });

    const slotsWithStatus = slots.map((slot) => {
      const inPast =
        slot.start < now && dayStart.toDateString() === now.toDateString();
      const candidateEnd = addBusinessMinutes(slot.start, serviceDuration);
      const intersects = bookings.some((b) =>
        isOverlap(slot.start, candidateEnd, b.startAt, b.endAt)
      );

      return {
        start: slot.start,
        end: slot.end,
        // ✅ keep ISO as label (frontend should store ISO)
        label: slot.start.toISOString(),
        booked: inPast || intersects,
      };
    });

    const dayBookings = bookings.filter(
      (b) => b.startAt >= atHM(dayStart, 0) && b.startAt < atHM(dayStart, 24)
    );

    const totalBookedMinutes = dayBookings.reduce((sum, b) => {
      const from = Math.max(atHM(dayStart, BUSINESS_START_HOUR), b.startAt);
      const to = Math.min(atHM(dayStart, BUSINESS_END_HOUR), b.endAt);
      return sum + Math.max(0, (to - from) / 60000);
    }, 0);

    return res.json({
      success: true,
      availableSlots: slotsWithStatus,
      fullyBooked: totalBookedMinutes >= MAX_DAY_MINUTES,
      totalBookedMinutes,
      remainingMinutes: Math.max(0, MAX_DAY_MINUTES - totalBookedMinutes),
    });
  } catch (err) {
    console.error("Availability error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function cancelBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    booking.status = "cancelled";
    await booking.save();
    res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function deleteBooking(req, res) {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// stubs
async function notifyCustomer() {}
async function notifyAdmin() {}

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getAvailability,
};
