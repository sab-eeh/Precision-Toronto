const twilio = require("twilio");

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error("❌ Twilio credentials missing in env");
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async ({ to, message }) => {
  try {
    if (!to || !message) {
      throw new Error("SMS 'to' or 'message' missing");
    }

    console.log("📩 Sending SMS →", to);

    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log("✅ SMS sent:", res.sid);

    return res;
  } catch (error) {
    console.error("❌ SMS Error:", error.message);

    // fail-safe
    return null;
  }
};

module.exports = { sendSMS };
