const express = require("express");
const router = express.Router();

const {
  getMessagesByPhone,
  getConversations,
} = require("../controllers/messageController");

// list conversations
router.get("/conversations", getConversations);

// get full conversation
router.get("/:phone", getMessagesByPhone);

module.exports = router;
