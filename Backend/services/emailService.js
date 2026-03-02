const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.ADMIN_EMAIL,
        name: "Precision Toronto",
      },
      subject,
      html,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error.message);
    throw error;
  }
};

module.exports = { sendEmail };
