// backend/src/utils/sms.js
// Twilio SMS helper with safe no-op fallback
let twilioClient = null;

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM,
  TWILIO_MESSAGING_SERVICE_SID,
} = process.env;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require("twilio");
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  } catch (err) {
    console.error("[Twilio] SDK init failed:", err?.message || err);
  }
} else {
  console.warn("[Twilio] Missing credentials; SMS will log to console.");
}

/**
 * Send an SMS (no throw). Returns message SID string on success, or null.
 * @param {string} to E.164 number, e.g., +12895551234
 * @param {string} body
 * @returns {Promise<string|null>}
 */
async function sendSMS(to, body) {
  if (!to || !body) return null;

  // Fallback when Twilio is not configured
  if (!twilioClient) {
    console.log(`📱 [SMS:SIMULATED] To: ${to}\n${body}`);
    return null;
  }

  // Build message payload
  const msgData = { to, body };
  if (TWILIO_MESSAGING_SERVICE_SID) {
    msgData.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  } else if (TWILIO_FROM) {
    msgData.from = TWILIO_FROM;
  } else {
    console.error(
      "[Twilio] No FROM number or Messaging Service SID configured."
    );
    return null;
  }

  try {
    const res = await twilioClient.messages.create(msgData);
    return res?.sid || null;
  } catch (err) {
    console.error("[Twilio] send failed:", err?.message || err);
    return null;
  }
}

module.exports = { sendSMS };
