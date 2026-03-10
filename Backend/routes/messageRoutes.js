const express = require("express");
const router = express.Router();

const {
  getMessagesByPhone,
  getConversations,
  replyToConversation,
  deleteConversation,
} = require("../controllers/messageController");

router.get("/conversations", getConversations);
router.get("/:phone", getMessagesByPhone);
router.post("/reply", replyToConversation);
router.delete("/conversation/:phone", deleteConversation);

module.exports = router;
