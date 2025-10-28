// backend/src/routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/emails");

/**
 * POST /api/contact
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    // --- Admin notification ---
    const adminHtml = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color:#c0392b;">📩 New Contact Message</h2>
        <table style="border-collapse:collapse;width:100%;">
          <tr><td><b>Name:</b></td><td>${name}</td></tr>
          <tr><td><b>Email:</b></td><td>${email}</td></tr>
          <tr><td><b>Phone:</b></td><td>${phone || "N/A"}</td></tr>
          <tr><td><b>Message:</b></td><td>${message}</td></tr>
        </table>
      </div>`;
    await sendEmail(
      process.env.ADMIN_EMAIL,
      "📩 New Contact Form Message",
      adminHtml
    );

    // --- User confirmation ---
    const userHtml = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color:#2b7a78;">✅ Message Received</h2>
        <p>Hi ${name},</p>
        <p>Thanks for reaching out to <b>Precision Toronto</b>. We'll reply soon.</p>
        <blockquote style="background:#f9f9f9;border-left:4px solid #2b7a78;padding:10px;">
          ${message}
        </blockquote>
        <p>If urgent, call us directly: 📞 +1 647-685-7153</p>
        <p>– Precision Toronto Team</p>
      </div>`;
    await sendEmail(email, "✅ We Received Your Message", userHtml);

    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

module.exports = router;
