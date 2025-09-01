const cron = require("node-cron");
const Booking = require("../models/Booking");
const sendEmail = require("./emails");
const sendSMS = require("./sms");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // add this in .env

// Run every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  console.log("🔔 Checking for upcoming bookings...");

  const now = new Date();
  const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

  try {
    const bookings = await Booking.find({
      startAt: {
        $gte: reminderTime,
        $lt: new Date(reminderTime.getTime() + 15 * 60 * 1000), // within next 15 min window
      },
      status: { $in: ["pending", "confirmed"] }, // only active bookings
    });

    for (let booking of bookings) {
      const bookingDate = new Date(booking.startAt).toLocaleString();

      // --- Customer Email Reminder ---
      if (booking.email) {
        const emailHtml = `
          <h2>Appointment Reminder</h2>
          <p>Dear ${booking.customerName},</p>
          <p>This is a friendly reminder for your booking tomorrow:</p>
          <p><strong>Service(s):</strong> ${booking.services.map(s => s.title).join(", ")}</p>
          <p><strong>Date & Time:</strong> ${bookingDate}</p>
          <p>We look forward to seeing you!</p>
        `;
        await sendEmail(booking.email, "⏰ Reminder: Your Booking Tomorrow", emailHtml);
      }

      // --- Customer SMS Reminder ---
      if (booking.phone) {
        const smsText = `⏰ Reminder: Hi ${booking.customerName}, your booking is tomorrow at ${bookingDate}. - Precision Toronto`;
        await sendSMS(booking.phone, smsText);
      }

      // --- Admin Email Notification ---
      if (ADMIN_EMAIL) {
        const adminHtml = `
          <h2>Booking Reminder (Admin)</h2>
          <p>Customer: ${booking.customerName}</p>
          <p>Phone: ${booking.phone}</p>
          <p>Email: ${booking.email || "N/A"}</p>
          <p>Services: ${booking.services.map(s => `${s.title} ($${s.price})`).join(", ")}</p>
          <p>Total Price: $${booking.totalPrice}</p>
          <p>Date & Time: ${bookingDate}</p>
        `;
        await sendEmail(ADMIN_EMAIL, "📋 Reminder: Upcoming Booking (24h)", adminHtml);
      }

      console.log(`✅ Reminder sent for booking: ${booking._id}`);
    }
  } catch (error) {
    console.error("❌ Reminder Scheduler Error:", error.message);
  }
});
