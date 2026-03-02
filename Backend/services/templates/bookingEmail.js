const dayjs = require("dayjs");

const bookingEmailTemplate = (booking, type = "admin") => {
  const date = dayjs(booking.startAt).format("MMM D, YYYY - h:mm A");

  const services =
    booking.services?.map((s) => `• ${s.name}`).join("<br/>") || "N/A";

  const serviceType =
    booking.serviceType === "mobile" ? "Mobile Service" : "Drop-off";

  const transportFee = booking.transportFee ? `$${booking.transportFee}` : "$0";

  const total = booking.totalPrice ? `$${booking.totalPrice}` : "N/A";

  const heading =
    type === "admin"
      ? "🚗 New Booking Received"
      : "✅ Your Booking is Confirmed";

  return `
  <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px;">
      
      <h2 style="color:#0ea5e9;">${heading}</h2>

      <p><strong>Customer:</strong> ${booking.customerName}</p>
      <p><strong>Phone:</strong> ${booking.phone}</p>
      <p><strong>Date:</strong> ${date}</p>

      <hr/>

      <p><strong>Services:</strong><br/>${services}</p>
      <p><strong>Service Type:</strong> ${serviceType}</p>
      <p><strong>City:</strong> ${booking.city || "N/A"}</p>

      <hr/>

      <p><strong>Transport Fee:</strong> ${transportFee}</p>
      <p><strong>Total Price:</strong> ${total}</p>

      <hr/>

      ${
        type === "customer"
          ? `<p style="color:#16a34a;">We’ll see you soon 🚀</p>`
          : `<p style="color:gray;">Admin Notification</p>`
      }

      <p style="font-size:12px; color:gray;">Precision Toronto</p>
    </div>
  </div>
  `;
};

module.exports = { bookingEmailTemplate };
