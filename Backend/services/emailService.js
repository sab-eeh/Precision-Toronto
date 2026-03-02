const sgMail = require("@sendgrid/mail");

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("❌ SENDGRID_API_KEY missing in env");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to) throw new Error("Recipient email missing");

    const msg = {
      to,
      from: {
        email: process.env.ADMIN_EMAIL,
        name: "Precision Toronto",
      },
      subject,
      html,
    };

    const response = await sgMail.send(msg);

    console.log("📧 Email sent:", response[0]?.statusCode);

    return response;
  } catch (error) {
    console.error("❌ SendGrid Error:", error.response?.body || error.message);

    // DO NOT crash app
    return null;
  }
};

module.exports = { sendEmail };
