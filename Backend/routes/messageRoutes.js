const express = require("express");
const router = express.Router();

const {
  getMessagesByPhone,
  getConversations,
  replyToConversation,
} = require("../controllers/messageController");

// list conversations
router.get("/conversations", getConversations);

// get full conversation
router.get("/:phone", getMessagesByPhone);

// admin reply
router.post("/reply", replyToConversation);

module.exports = router;
