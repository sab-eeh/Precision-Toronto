const { sendSMS } = require("./smsService");
const { sendEmail } = require("./emailService");
const { bookingEmailTemplate } = require("./templates/bookingEmail");

const sendBookingNotifications = async (booking) => {
  try {
    const date = new Date(booking.startAt).toLocaleString();

    const smsMessage = `🚗 Precision Toronto

Hi ${booking.customerName},
Your booking is confirmed.

📅 ${date}
📍 ${booking.city || "N/A"}
🚘 ${booking.serviceType}

Thank you!`;

    const adminEmailHTML = bookingEmailTemplate(booking, "admin");
    const customerEmailHTML = bookingEmailTemplate(booking, "customer");

    const results = await Promise.allSettled([
      // SMS
      sendSMS({
        to: booking.phone,
        message: smsMessage,
      }),

      // Admin Email
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "🚗 New Booking Received",
        html: adminEmailHTML,
      }),

      // Customer Email
      booking.email &&
        sendEmail({
          to: booking.email,
          subject: "✅ Booking Confirmation",
          html: customerEmailHTML,
        }),
    ]);

    console.log(
      "📊 Notification Results:",
      results.map((r) => r.status)
    );

    return results;
  } catch (err) {
    console.error("❌ Notification system error:", err.message);
  }
};

module.exports = { sendBookingNotifications };
