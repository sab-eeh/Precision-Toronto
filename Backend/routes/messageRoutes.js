const express = require("express");
const router = express.Router();

const {
  getMessagesByPhone,
  getConversations,
  replyToConversation,
  deleteConversation,
  togglePinConversation,
  markConversationRead
} = require("../controllers/messageController");

router.get("/conversations", getConversations);
router.get("/:phone", getMessagesByPhone);
router.post("/reply", replyToConversation);
router.delete("/conversation/:phone", deleteConversation);
router.patch("/conversation/:phone/pin", togglePinConversation);
router.patch("/conversation/:phone/read", markConversationRead);

module.exports = router;
