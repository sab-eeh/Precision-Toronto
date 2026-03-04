const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

router.post("/incoming", async (req, res) => {
  try {
    const { Body, From, To } = req.body;

    if (!Body || !From) {
      console.warn("⚠️ Invalid SMS payload received");
      return res.status(200).send("<Response></Response>");
    }

    console.log(`📩 Incoming SMS from ${From}`);

    const newMessage = await Message.create({
      from: From,
      to: To,
      body: Body,
      direction: "inbound",
    });

    // 🔥 Emit real-time event
    if (global.io) {
      global.io.emit("newMessage", newMessage);
    }

    res.status(200).send("<Response></Response>");
  } catch (error) {
    console.error("❌ SMS Webhook Error:", error.message);

    // Twilio must still receive response
    res.status(200).send("<Response></Response>");
  }
});

module.exports = router;
