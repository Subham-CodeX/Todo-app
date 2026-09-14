const express = require("express");

const router =
  express.Router();

const {
  getMessages,
  createMessage,
} = require(
  "../controllers/messageController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

// ============================================
// ALL MESSAGE ROUTES REQUIRE AUTHENTICATION
// ============================================

router.use(protect);

// ============================================
// GET CHAT HISTORY / SYNC
// ============================================
//
// GET /api/messages/:userId
//
// Normal:
// ?limit=100
//
// Older:
// ?before=DATE
//
// Newer sync:
// ?after=DATE
// ============================================

router.get(
  "/:userId",
  getMessages
);

// ============================================
// SEND MESSAGE
// ============================================
//
// POST /api/messages/:userId
//
// Body:
// {
//   "text": "Hello",
//   "clientMessageId": "uuid"
// }
// ============================================

router.post(
  "/:userId",
  createMessage
);

module.exports =
  router;