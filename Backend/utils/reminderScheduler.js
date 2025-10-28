// backend/src/utils/reminderScheduler.js
const cron = require("node-cron");
const Booking = require("../models/Booking");
const sendEmail = require("./emails");
const { sendSMS } = require("./sms");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

/**
 * Every 15 minutes: find bookings ~24h away and send reminders
 */
cron.schedule("*/15 * * * *", async () => {
  const now = new Date();
  const target = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h later

  console.log("🔔 Checking for bookings starting ~24h from now");

  try {
    const bookings = await Booking.find({
      startAt: {
        $gte: target,
        $lt: new Date(target.getTime() + 15 * 60 * 1000),
      },
      status: { $in: ["pending", "confirmed"] },
    });

    for (const b of bookings) {
      const dateStr = new Date(b.startAt).toLocaleString();

      // Customer email
      if (b.email) {
        const html = `
          <h2>Appointment Reminder</h2>
          <p>Dear ${b.customerName},</p>
          <p>This is a friendly reminder for your booking tomorrow:</p>
          <p><strong>Services:</strong> ${b.services
            .map((s) => s.title)
            .join(", ")}</p>
          <p><strong>Date & Time:</strong> ${dateStr}</p>`;
        await sendEmail(b.email, "⏰ Reminder: Your Booking Tomorrow", html);
      }

      // Customer SMS
      if (b.phone) {
        const text = `⏰ Reminder: Hi ${b.customerName}, your booking is tomorrow at ${dateStr}. - Precision Toronto`;
        await sendSMS(b.phone, text);
      }

      // Admin notification
      if (ADMIN_EMAIL) {
        const html = `
          <h2>Upcoming Booking (24h Reminder)</h2>
          <p>Customer: ${b.customerName}</p>
          <p>Phone: ${b.phone}</p>
          <p>Email: ${b.email || "N/A"}</p>
          <p>Services: ${b.services
            .map((s) => `${s.title} ($${s.price})`)
            .join(", ")}</p>
          <p>Total: $${b.totalPrice}</p>
          <p>Date & Time: ${dateStr}</p>`;
        await sendEmail(ADMIN_EMAIL, "📋 Reminder: Booking in 24h", html);
      }

      console.log(`✅ Reminder sent for booking ${b._id}`);
    }
  } catch (err) {
    console.error("❌ Reminder scheduler error:", err.message);
  }
});
