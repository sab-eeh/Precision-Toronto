const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    // --------- Admin Email ---------
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#c0392b;">📩 New Contact Form Submission</h2>
        <table style="border-collapse: collapse; width: 100%; margin-top:15px;">
          <tr><td><b>Name:</b></td><td>${name}</td></tr>
          <tr><td><b>Email:</b></td><td>${email}</td></tr>
          <tr><td><b>Phone:</b></td><td>${phone || "N/A"}</td></tr>
          <tr><td><b>Message:</b></td><td>${message}</td></tr>
        </table>
        <p style="margin-top:20px; color:#555;">This message came from your website contact page.</p>
      </div>
    `;
    await sendEmail(
      process.env.ADMIN_EMAIL,
      "📩 New Contact Form Message",
      adminHtml
    );

    // --------- User Email ---------
    const userHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#2b7a78;">✅ We’ve Received Your Message</h2>
        <p>Hi ${name},</p>
        <p>Thank you for reaching out to <b>Precision Toronto</b>. Our team will respond shortly.</p>
        <p><b>Your Message:</b></p>
        <blockquote style="margin:10px 0; padding:10px; background:#f9f9f9; border-left:4px solid #2b7a78;">
          ${message}
        </blockquote>
        <p>If urgent, call us directly:</p>
        <p>📞 +1 647-685-7153</p>
        <p style="margin-top:20px;">Best regards,<br/>Precision Toronto Team</p>
      </div>
    `;
    await sendEmail(email, "✅ We Received Your Message", userHtml);

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Contact form error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send message." });
  }
});

module.exports = router;
