// Stub email sender — integrate your provider (e.g., Nodemailer, SendGrid)
async function sendEmail(to, subject, html) {
  if (!to) return;
  console.log(`📧 [EMAIL] To: ${to} | Subject: ${subject}\n${html}`);
  // TODO: integrate real email service here
}

module.exports = sendEmail;
