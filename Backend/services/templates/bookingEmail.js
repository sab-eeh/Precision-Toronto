const bookingEmailTemplate = (booking) => {
  const date = new Date(booking.startAt).toLocaleString();

  const services = booking.services.map((s) => s.name).join(", ");

  return `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color: #0ea5e9;">🚗 New Booking Received</h2>
        
        <p><strong>Customer:</strong> ${booking.customerName}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Services:</strong> ${services}</p>
  
        <hr />
  
        <p style="color: gray;">Precision Toronto System</p>
      </div>
    `;
};

module.exports = { bookingEmailTemplate };
