const mongoose = require("mongoose");

const {
  getChatHistory,
  getMessagesAfter,
  saveMessage,
  markConversationRead,
} = require("../services/messageService");

const Connection =
  require("../models/Connection");

// ============================================
// HELPERS
// ============================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const findConnection = async (
  userA,
  userB
) => {
  return Connection.findOne({
    $or: [
      {
        sender: userA,
        receiver: userB,
      },
      {
        sender: userB,
        receiver: userA,
      },
    ],
  });
};

const requireAcceptedConnection =
  async (
    userId,
    otherUserId
  ) => {
    const connection =
      await findConnection(
        userId,
        otherUserId
      );

    if (!connection) {
      throw new Error(
        "You are not connected with this user"
      );
    }

    if (
      connection.status !==
      "accepted"
    ) {
      throw new Error(
        "Chat is only available for accepted connections"
      );
    }

    return connection;
  };

// ============================================
// GET CHAT
// ============================================
//
// GET /api/messages/:userId
//
// Normal history:
//
// /api/messages/USER_ID?limit=100
//
// Sync:
//
// /api/messages/USER_ID?after=DATE
// ============================================

exports.getMessages = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.id;

    const otherUserId =
      req.params.userId;

    if (
      !isValidObjectId(
        otherUserId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    if (
      userId.toString() ===
      otherUserId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot open a chat with yourself",
      });
    }

    await requireAcceptedConnection(
      userId,
      otherUserId
    );

    // ========================================
    // SYNC MODE
    // ========================================

    if (req.query.after) {
      const messages =
        await getMessagesAfter({
          userId,
          otherUserId,

          after:
            req.query.after,

          limit:
            req.query.limit ||
            200,
        });

      return res.status(200).json({
        success: true,

        messages,

        sync: true,

        hasMore:
          messages.length >=
          Math.min(
            Number(
              req.query.limit ||
                200
            ),
            500
          ),
      });
    }

    // ========================================
    // NORMAL HISTORY MODE
    // ========================================

    const limit =
      req.query.limit ||
      100;

    const before =
      req.query.before ||
      null;

    const messages =
      await getChatHistory({
        userId,
        otherUserId,

        limit,

        before,
      });

    // ========================================
    // MARK READ
    // ========================================

    await markConversationRead({
      userId,
      otherUserId,
    });

    return res.status(200).json({
      success: true,

      messages,

      pagination: {
        limit:
          Number(limit) ||
          100,

        before,

        hasMore:
          messages.length ===
          Math.min(
            Number(limit) ||
              100,
            100
          ),
      },
    });

  } catch (error) {
    console.error(
      "Get Messages Error:",
      error
    );

    return res.status(403).json({
      success: false,
      message:
        error.message ||
        "Failed to load messages",
    });
  }
};

// ============================================
// SEND MESSAGE THROUGH REST
// ============================================
//
// Used mainly for:
// - offline queue
// - Socket.IO unavailable
// - reconnect synchronization
//
// POST /api/messages/:userId
// ============================================

exports.createMessage = async (
  req,
  res
) => {
  try {
    const senderId =
      req.user.id;

    const receiverId =
      req.params.userId;

    const {
      text,
      message,
      clientMessageId,
    } = req.body;

    if (
      !isValidObjectId(
        receiverId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid receiver ID",
      });
    }

    if (
      senderId.toString() ===
      receiverId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot send a message to yourself",
      });
    }

    await requireAcceptedConnection(
      senderId,
      receiverId
    );

    const savedMessage =
      await saveMessage({
        senderId,

        receiverId,

        text:
          text !== undefined
            ? text
            : message,

        clientMessageId,
      });

    return res.status(201).json({
      success: true,

      message:
        savedMessage,
    });

  } catch (error) {
    console.error(
      "Create Message Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to send message",
    });
  }
};