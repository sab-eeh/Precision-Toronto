// Stub SMS sender — integrate your provider (e.g., Twilio)
async function sendSMS(to, message) {
  if (!to) return;
  console.log(`📱 [SMS] To: ${to} | Message: ${message}`);
  // TODO: integrate real SMS service here
}

module.exports = sendSMS;
