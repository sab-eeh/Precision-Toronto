const sendSMS = async ({ to, message }) => {
  try {
    console.log("📩 Sending SMS to:", to); // 👈 ADD THIS

    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log("✅ SMS sent:", res.sid); // 👈 ADD THIS

    return res;
  } catch (error) {
    console.error("❌ SMS Error:", error.message);
    throw error;
  }
};
