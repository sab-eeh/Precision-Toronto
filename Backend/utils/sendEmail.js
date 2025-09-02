// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"No Reply" <no-reply@example.com>',
    to,
    subject,
    text,
    html,
  });

  // useful for dev when using ethereal
  console.log("Email sent:", info.messageId);
  return info;
};

module.exports = sendEmail;
