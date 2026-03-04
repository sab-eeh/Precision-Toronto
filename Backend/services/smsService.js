const twilio = require("twilio");
const Message = require("../models/Message");

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error("❌ Twilio credentials missing in environment variables");
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async ({ to, message, serviceType = null }) => {
  if (!to || !message) {
    throw new Error("SMS requires 'to' and 'message'");
  }

  try {
    console.log(`📤 Sending SMS → ${to}`);

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    // Save message to database
    const savedMessage = await Message.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      body: message,
      direction: "outbound",
      serviceType,
    });

    // Emit real-time event
    const io = global.io;

    if (io) {
      io.emit("newMessage", savedMessage);
    }

    console.log("✅ SMS sent:", res.sid);

    return savedMessage, response;
  } catch (error) {
    console.error("❌ Twilio SMS Error:", error.message);

    return null;
  }
};

module.exports = { sendSMS };
