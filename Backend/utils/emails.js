// backend/src/utils/emails.js
// Nodemailer wrapper with graceful fallback to console in dev
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@example.com";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!EMAIL_USER || !EMAIL_PASS) {
    // No SMTP configured: fallback to console logger
    return null;
  }

  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail", // or use host/port/secure
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  return transporter;
}

/**
 * Send an HTML email (no throw; logs errors and returns false on failure)
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @returns {Promise<boolean>}
 */
async function sendEmail(to, subject, html) {
  if (!to) return false;

  const tx = getTransporter();
  if (!tx) {
    // Dev fallback
    console.log(
      `📧 [EMAIL:SIMULATED] To: ${to} | Subject: ${subject}\n${html}`
    );
    return true;
  }

  try {
    await tx.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("[Email] send failed:", err?.message || err);
    return false;
  }
}

module.exports = sendEmail;
