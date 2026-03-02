const { sendSMS } = require("./smsService");
const { sendEmail } = require("./emailService");
const { bookingEmailTemplate } = require("./templates/bookingEmail");

const sendBookingNotifications = async (booking) => {
  try {
    const smsMessage = `Hi ${
      booking.customerName
    }, your booking is confirmed for ${new Date(
      booking.startAt
    ).toLocaleString()}.`;

    const emailHTML = bookingEmailTemplate(booking);

    await Promise.allSettled([
      sendSMS({
        to: booking.phone,
        message: smsMessage,
      }),
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "New Booking - Precision Toronto",
        html: emailHTML,
      }),
    ]);
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

module.exports = { sendBookingNotifications };
