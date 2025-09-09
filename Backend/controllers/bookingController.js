const Booking = require("../models/Booking");
const { addMinutes, generateSlotsForDay, isOverlap } = require("../utils/time");
const sendEmail = require("../utils/emails");
const sendSMS = require("../utils/sms");

// Business rules
const MAX_DAY_MINUTES = 600; // 10 hours per day
const BUSINESS_START_HOUR = 8; // 8 AM
const BUSINESS_END_HOUR = 20; // 8 PM

/**
 * Compute total duration from selected services & addons
 */
function computeDurationMinutes(services = [], addons = [], fallback = 60) {
  const totalServices = services.reduce(
    (sum, s) => sum + (Number(s.durationMinutes) || 0),
    0
  );
  const totalAddons = addons.reduce(
    (sum, a) => sum + (Number(a.durationMinutes) || 0),
    0
  );
  const total = totalServices + totalAddons;
  return total > 0 ? total : fallback;
}

/**
 * Normalize payload from frontend → backend shape
 */
function normalizePayload(body) {
  const {
    customerInfo,
    vehicleInfo,
    selectedServices,
    selectedAddons,
    totalPrice,
    startAt,
    notes,
    address,
  } = body;

  return {
    customerName: customerInfo?.name?.trim(),
    phone: (customerInfo?.phone || "").trim(),
    email: (customerInfo?.email || "").trim().toLowerCase(),
    address: address || customerInfo?.address || "",

    vehicle: {
      type: vehicleInfo?.type || "sedan",
      make: vehicleInfo?.make,
      model: vehicleInfo?.model,
      year: vehicleInfo?.year,
      color: vehicleInfo?.color,
      plate: vehicleInfo?.license,
    },

    services: (selectedServices || []).map((s) => ({
      serviceId: s._id || null,
      title: s.title,
      price: Number(s.price) || 0,
      durationMinutes: Number(s.durationMinutes) || 60,
    })),

    addons: (selectedAddons || []).map((a) => ({
      addonId: a._id || null,
      title: a.title,
      price: Number(a.price) || 0,
      durationMinutes: Number(a.durationMinutes) || 30,
    })),

    totalPrice: Number(totalPrice) || 0,
    startAt,
    notes,
  };
}

/**
 * Create Booking
 */
const createBooking = async (req, res) => {
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
    const end = addMinutes(start, durationMinutes);

    // Check overlap with existing bookings
    const overlapping = await Booking.findOne({
      status: { $ne: "cancelled" },
      $expr: {
        $and: [{ $lt: ["$startAt", end] }, { $gt: ["$endAt", start] }],
      },
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message:
          "Selected time overlaps with an existing booking. Please choose a different time.",
      });
    }

    const booking = await Booking.create({
      ...data,
      startAt: start,
      endAt: end,
      durationMinutes,
      status: "confirmed",
      source: "web",
    });

    // Send notifications (async, don’t block response)
    notifyCustomer(booking);
    notifyAdmin(booking);

    return res
      .status(201)
      .json({ success: true, message: "Booking created", booking });
  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * List all bookings (admin)
 */
const listBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ startAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("List bookings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get single booking
 */
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, booking });
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update booking (admin)
 */
const updateBooking = async (req, res) => {
  try {
    const updates = normalizePayload(req.body);

    // If updating time/services, recalc endAt
    if (updates.startAt || updates.services || updates.addons) {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }

      const newStart = updates.startAt
        ? new Date(updates.startAt)
        : booking.startAt;
      const durationMinutes = computeDurationMinutes(
        updates.services || booking.services,
        updates.addons || booking.addons
      );
      const newEnd = addMinutes(newStart, durationMinutes);

      // Check overlap
      const overlapping = await Booking.findOne({
        _id: { $ne: booking._id },
        status: { $ne: "cancelled" },
        $expr: {
          $and: [{ $lt: ["$startAt", newEnd] }, { $gt: ["$endAt", newStart] }],
        },
      });

      if (overlapping) {
        return res.status(409).json({
          success: false,
          message:
            "Updated time overlaps with an existing booking. Please select a different time.",
        });
      }

      updates.startAt = newStart;
      updates.endAt = newEnd;
      updates.durationMinutes = durationMinutes;
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking updated", booking: updated });
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Cancel booking
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    booking.status = "cancelled";
    await booking.save();
    res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Delete booking (admin)
 */
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Availability slots for a given day
 */
const getAvailability = async (req, res) => {
  try {
    const { date, durationMinutes = 60 } = req.query;
    if (!date) {
      return res
        .status(422)
        .json({ success: false, message: "Missing date query param" });
    }

    const serviceDuration = Number(durationMinutes);

    // Day range
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Fetch bookings for that day
    const bookings = await Booking.find({
      startAt: { $gte: dayStart, $lt: dayEnd },
      status: { $ne: "cancelled" },
    });

    // Compute booked minutes
    const totalBookedMinutes = bookings.reduce((sum, b) => {
      const dur = (b.endAt - b.startAt) / 60000;
      return sum + dur;
    }, 0);

    const isFullyBooked = totalBookedMinutes >= MAX_DAY_MINUTES;

    // Generate slots
    const slots = generateSlotsForDay(dayStart, {
      startHour: BUSINESS_START_HOUR,
      endHour: BUSINESS_END_HOUR,
      slotMinutes: 60,
    });

    const slotsWithStatus = slots.map((slot) => {
      const slotEndIfServiceAdded = addMinutes(slot.start, serviceDuration);

      const businessDayEnd = new Date(slot.start);
      businessDayEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);

      const exceedsDay = slotEndIfServiceAdded > businessDayEnd;

      const isBooked = bookings.some((b) =>
        isOverlap(slot.start, slot.end, b.startAt, b.endAt)
      );

      return {
        start: slot.start,
        end: slot.end,
        label: slot.start.toISOString(),
        booked: isBooked || isFullyBooked || exceedsDay,
      };
    });

    return res.json({
      success: true,
      availableSlots: slotsWithStatus,
      fullyBooked: isFullyBooked,
      totalBookedMinutes,
      remainingMinutes: Math.max(0, MAX_DAY_MINUTES - totalBookedMinutes),
    });
  } catch (err) {
    console.error("Availability error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Notifications
 */
async function notifyCustomer(booking) {
  const bookingDate = new Date(booking.startAt).toLocaleString();
  if (booking.email) {
    const html = `
      <h2>Booking Confirmation</h2>
      <p>Hi ${booking.customerName},</p>
      <p>Your booking is confirmed for ${bookingDate}.</p>
      <p>Address: ${booking.address || "N/A"}</p>
      <p>Total: $${booking.totalPrice}</p>`;
    sendEmail(booking.email, "Your Booking Confirmation", html).catch(
      console.error
    );
  }
  if (booking.phone) {
    const sms = `Hi ${booking.customerName}, your booking is confirmed for ${bookingDate}. Total $${booking.totalPrice}.`;
    sendSMS(booking.phone, sms).catch(console.error);
  }
}

async function notifyAdmin(booking) {
  if (!process.env.ADMIN_EMAIL && !process.env.ADMIN_PHONE) return;
  const bookingDate = new Date(booking.startAt).toLocaleString();
  if (process.env.ADMIN_EMAIL) {
    const html = `<h2>New Booking</h2>
      <p>${booking.customerName} - ${booking.phone}</p>
      <p>${bookingDate}</p>
      <p>Total: $${booking.totalPrice}</p>`;
    sendEmail(process.env.ADMIN_EMAIL, "New Booking Received", html).catch(
      console.error
    );
  }
  if (process.env.ADMIN_PHONE) {
    const sms = `📢 New Booking: ${booking.customerName} at ${bookingDate} | $${booking.totalPrice}`;
    sendSMS(process.env.ADMIN_PHONE, sms).catch(console.error);
  }
}

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getAvailability,
};
