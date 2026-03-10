const { sendSMS } = require("./smsService");
const { sendEmail } = require("./emailService");
const { bookingEmailTemplate } = require("./templates/bookingEmail");
const Message = require("../models/Message");

/**
 * Format date safely
 */
const formatDate = (date) => {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return "Scheduled Time";
  }
};

/**
 * Build SMS for customer depending on service type
 */
const buildCustomerSMS = (booking) => {
  const date = formatDate(booking.startAt);
  const serviceType = booking.serviceType?.toLowerCase();

  if (serviceType === "mobile") {
    return `🚗 Precision Toronto

Hi ${booking.customerName || "Customer"},

Your detailing appointment has been confirmed.

📅 ${date}
📍 ${booking.city || "N/A"} (Mobile Service)

Our team will arrive fully equipped to deliver a professional service.

Please remove personal belongings from the vehicle before arrival.

Reply to this message if you need to make any changes.

Thank you for choosing Precision Toronto.`;
  }

  return `🚗 Precision Toronto

Hi ${booking.customerName || "Customer"},

Your detailing appointment has been confirmed.

📅 ${date}
📍 ${booking.city || "N/A"} (Drop-Off Service)

Please arrive at your scheduled time and message us when you arrive.

For the best results, remove personal belongings before drop-off.

Reply to this message if you need to make any changes.

Thank you for choosing Precision Toronto.`;
};

/**
 * Build SMS for admin
 */
const buildAdminSMS = (booking) => {
  const date = formatDate(booking.startAt);

  return `🚨 New Booking Alert

Customer: ${booking.customerName || "Unknown"}
Phone: ${booking.phone || "N/A"}

📅 ${date}
📍 ${booking.city || "N/A"}
🚘 ${booking.serviceType || "service"}

Check admin dashboard for details.`;
};

/**
 * Send booking notifications
 */
const sendBookingNotifications = async (booking) => {
  try {
    if (!booking) {
      console.warn("⚠️ Booking notification skipped (no booking object)");
      return null;
    }

    const jobs = [];

    const customerSMS = buildCustomerSMS(booking);
    const adminSMS = buildAdminSMS(booking);

    const adminEmailHTML = bookingEmailTemplate(booking, "admin");
    const customerEmailHTML = bookingEmailTemplate(booking, "customer");

    // Send customer SMS
    if (booking.phone) {
      jobs.push(
        sendSMS({
          to: booking.phone,
          message: customerSMS,
          serviceType: booking.serviceType,
        })
      );
    }

    // Send admin SMS alert
    // Send customer SMS
    if (booking.phone) {
      await sendSMS({
        to: booking.phone,
        message: customerSMS,
        serviceType: booking.serviceType,
      });

      /* Save message to CRM */
      const savedMessage = await Message.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: booking.phone,
        body: customerSMS,
        direction: "outbound",
        read: true,
      });

      /* Emit realtime update */
      if (global.io) {
        global.io.emit("newMessage", savedMessage);
      }
    }

    // Send admin email
    if (process.env.ADMIN_EMAIL) {
      jobs.push(
        sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "🚗 New Booking - Precision Toronto",
          html: adminEmailHTML,
        })
      );
    }

    // Send customer email
    if (booking.email) {
      jobs.push(
        sendEmail({
          to: booking.email,
          subject: "✅ Your Booking is Confirmed",
          html: customerEmailHTML,
        })
      );
    }

    if (!jobs.length) {
      console.warn("⚠️ No notification jobs were created");
      return null;
    }

    const results = await Promise.allSettled(jobs);

    console.log(
      "📊 Notification results:",
      results.map((r) => r.status)
    );

    return results;
  } catch (error) {
    console.error("❌ Notification system error:", error.message);
    return null;
  }
};

module.exports = { sendBookingNotifications };
