const Message = require("../models/Message");
const { sendSMS } = require("../services/smsService");

/**
 * Get all messages for a specific phone conversation
 */
const getMessagesByPhone = async (req, res) => {
  try {
    let { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    // Normalize phone format
    phone = phone.replace(/\s/g, "");

    const messages = await Message.find({
      $or: [{ from: phone }, { to: phone }],
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("❌ Fetch messages error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

/**
 * Get conversation list (for admin inbox sidebar)
 */
const getConversations = async (req, res) => {
  try {
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioNumber) {
      throw new Error("Twilio phone number not configured");
    }

    const conversations = await Message.aggregate([
      {
        $addFields: {
          contact: {
            $cond: [{ $eq: ["$from", twilioNumber] }, "$to", "$from"],
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$contact",
          lastMessage: { $first: "$body" },
          lastTime: { $first: "$createdAt" },
          serviceType: { $first: "$serviceType" },
        },
      },
      {
        $project: {
          phone: "$_id",
          lastMessage: 1,
          lastTime: 1,
          serviceType: 1,
          _id: 0,
        },
      },
      {
        $sort: { lastTime: -1 },
      },
    ]);

    res.json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error("❌ Conversations fetch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

/**
 * Admin reply to conversation
 */
const replyToConversation = async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Phone and message required",
      });
    }

    await sendSMS({
      to: phone,
      message,
    });

    const savedMessage = await Message.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
      body: message,
      direction: "outbound",
    });

    // Emit real-time update
    if (global.io) {
      global.io.emit("newMessage", savedMessage);
    }

    res.json({
      success: true,
      data: savedMessage,
    });
  } catch (error) {
    console.error("Reply error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    const deleted = await Message.deleteMany({
      $or: [{ from: phone }, { to: phone }],
    });

    res.json({
      success: true,
      deletedCount: deleted.deletedCount,
    });
  } catch (error) {
    console.error("❌ Delete conversation error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
    });
  }
};

module.exports = {
  getMessagesByPhone,
  getConversations,
  replyToConversation,
  deleteConversation
};
