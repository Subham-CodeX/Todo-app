const crypto = require("crypto");
const mongoose = require("mongoose");

const Message = require("../models/Message");
const User = require("../models/User");

// ============================================
// HELPERS
// ============================================

const generateMessageId = () => {
  return crypto.randomUUID();
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================
// FORMAT MESSAGE
// ============================================

const formatMessage = (message) => {
  if (!message) {
    return null;
  }

  return {
    id: message._id?.toString(),

    messageId: message.messageId,
    message_id: message.messageId,

    clientMessageId:
      message.clientMessageId,

    client_message_id:
      message.clientMessageId,

    senderId:
      message.senderId?.toString(),

    sender_id:
      message.senderId?.toString(),

    receiverId:
      message.receiverId?.toString(),

    receiver_id:
      message.receiverId?.toString(),

    text: message.text,

    message: message.text,

    status: message.status,

    createdAt:
      message.createdAt,

    created_at:
      message.createdAt,

    deliveredAt:
      message.deliveredAt || null,

    delivered_at:
      message.deliveredAt || null,

    readAt:
      message.readAt || null,

    read_at:
      message.readAt || null,
  };
};

// ============================================
// ENSURE USER EXISTS
// ============================================

const ensureUserExists = async (
  userId
) => {
  if (!isValidObjectId(userId)) {
    return null;
  }

  return User.findById(userId)
    .select("_id")
    .lean();
};

// ============================================
// SAVE MESSAGE
// ============================================

const saveMessage = async ({
  senderId,
  receiverId,
  message,
  text,
  clientMessageId,
}) => {
  if (!isValidObjectId(senderId)) {
    throw new Error(
      "Invalid sender ID"
    );
  }

  if (!isValidObjectId(receiverId)) {
    throw new Error(
      "Invalid receiver ID"
    );
  }

  if (
    senderId.toString() ===
    receiverId.toString()
  ) {
    throw new Error(
      "You cannot send a message to yourself"
    );
  }

  const sender =
    await ensureUserExists(senderId);

  if (!sender) {
    throw new Error(
      "Sender account not found"
    );
  }

  const receiver =
    await ensureUserExists(receiverId);

  if (!receiver) {
    throw new Error(
      "Receiver account not found"
    );
  }

  const messageText = String(
    text !== undefined
      ? text
      : message !== undefined
      ? message
      : ""
  ).trim();

  if (!messageText) {
    throw new Error(
      "Message cannot be empty"
    );
  }

  if (messageText.length > 10000) {
    throw new Error(
      "Message is too long"
    );
  }

  const finalClientMessageId =
    clientMessageId &&
    String(clientMessageId).trim()
      ? String(clientMessageId).trim()
      : crypto.randomUUID();

  // ==========================================
  // IDEMPOTENCY
  // ==========================================

  const existingMessage =
    await Message.findOne({
      clientMessageId:
        finalClientMessageId,
    });

  if (existingMessage) {
    return formatMessage(
      existingMessage
    );
  }

  // ==========================================
  // CREATE
  // ==========================================

  const messageDocument =
    new Message({
      messageId:
        generateMessageId(),

      clientMessageId:
        finalClientMessageId,

      senderId,

      receiverId,

      text: messageText,

      status: "sent",
    });

  try {
    await messageDocument.save();
  } catch (error) {
    // ========================================
    // DUPLICATE RETRY
    // ========================================

    if (
      error?.code === 11000
    ) {
      const duplicate =
        await Message.findOne({
          clientMessageId:
            finalClientMessageId,
        });

      if (duplicate) {
        return formatMessage(
          duplicate
        );
      }
    }

    throw error;
  }

  return formatMessage(
    messageDocument
  );
};

// ============================================
// GET CHAT HISTORY
// ============================================

const getChatHistory = async ({
  userId,
  otherUserId,
  limit = 100,
  before = null,
}) => {
  if (!isValidObjectId(userId)) {
    throw new Error(
      "Invalid user ID"
    );
  }

  if (!isValidObjectId(otherUserId)) {
    throw new Error(
      "Invalid other user ID"
    );
  }

  let safeLimit =
    Number(limit);

  if (
    !Number.isInteger(safeLimit) ||
    safeLimit <= 0
  ) {
    safeLimit = 100;
  }

  safeLimit = Math.min(
    safeLimit,
    100
  );

  const query = {
    $or: [
      {
        senderId: userId,
        receiverId: otherUserId,
      },
      {
        senderId: otherUserId,
        receiverId: userId,
      },
    ],
  };

  if (before) {
    const beforeDate =
      new Date(before);

    if (
      !Number.isNaN(
        beforeDate.getTime()
      )
    ) {
      query.createdAt = {
        $lt: beforeDate,
      };
    }
  }

  const messages =
    await Message.find(query)
      .sort({
        createdAt: -1,
      })
      .limit(safeLimit)
      .lean();

  messages.reverse();

  return messages.map(
    formatMessage
  );
};

// ============================================
// GET NEWER MESSAGES
// ============================================
//
// Used by local synchronization.
//
// after = latest locally known server time.
//
// ============================================

const getMessagesAfter = async ({
  userId,
  otherUserId,
  after = null,
  limit = 200,
}) => {
  if (!isValidObjectId(userId)) {
    throw new Error(
      "Invalid user ID"
    );
  }

  if (!isValidObjectId(otherUserId)) {
    throw new Error(
      "Invalid user ID"
    );
  }

  let safeLimit =
    Number(limit);

  if (
    !Number.isInteger(safeLimit) ||
    safeLimit <= 0
  ) {
    safeLimit = 200;
  }

  safeLimit = Math.min(
    safeLimit,
    500
  );

  const query = {
    $or: [
      {
        senderId: userId,
        receiverId: otherUserId,
      },
      {
        senderId: otherUserId,
        receiverId: userId,
      },
    ],
  };

  // ==========================================
  // AFTER CURSOR
  // ==========================================

  if (after) {
    const afterDate =
      new Date(after);

    if (
      !Number.isNaN(
        afterDate.getTime()
      )
    ) {
      query.createdAt = {
        $gt: afterDate,
      };
    }
  }

  const messages =
    await Message.find(query)
      .sort({
        createdAt: 1,
      })
      .limit(safeLimit)
      .lean();

  return messages.map(
    formatMessage
  );
};

// ============================================
// GET OFFLINE MESSAGES
// ============================================

const getOfflineMessages =
  async (userId) => {
    if (!isValidObjectId(userId)) {
      throw new Error(
        "Invalid user ID"
      );
    }

    const messages =
      await Message.find({
        receiverId: userId,

        status: {
          $in: ["sent"],
        },
      })
        .sort({
          createdAt: 1,
        })
        .limit(500)
        .lean();

    return messages.map(
      formatMessage
    );
  };

// ============================================
// MARK DELIVERED
// ============================================

const markDelivered =
  async (messageId) => {
    if (!messageId) {
      return null;
    }

    const message =
      await Message.findOneAndUpdate(
        {
          messageId,

          status: {
            $in: [
              "sent",
              "pending",
            ],
          },
        },
        {
          $set: {
            status: "delivered",

            deliveredAt:
              new Date(),
          },
        },
        {
          new: true,
        }
      ).lean();

    return formatMessage(
      message
    );
  };

// ============================================
// MARK MULTIPLE DELIVERED
// ============================================

const markMessagesDelivered =
  async (messageIds) => {
    if (
      !Array.isArray(
        messageIds
      ) ||
      messageIds.length === 0
    ) {
      return [];
    }

    const validIds =
      messageIds.filter(
        (id) =>
          typeof id ===
            "string" &&
          id.trim()
      );

    if (
      validIds.length === 0
    ) {
      return [];
    }

    await Message.updateMany(
      {
        messageId: {
          $in: validIds,
        },

        status: {
          $in: [
            "sent",
            "pending",
          ],
        },
      },
      {
        $set: {
          status: "delivered",

          deliveredAt:
            new Date(),
        },
      }
    );

    const messages =
      await Message.find({
        messageId: {
          $in: validIds,
        },
      }).lean();

    return messages.map(
      formatMessage
    );
  };

// ============================================
// MARK READ
// ============================================

const markMessageRead =
  async ({
    messageId,
    userId,
  }) => {
    if (!messageId) {
      return null;
    }

    if (!isValidObjectId(userId)) {
      throw new Error(
        "Invalid user ID"
      );
    }

    const message =
      await Message.findOneAndUpdate(
        {
          messageId,

          receiverId: userId,

          status: {
            $ne: "read",
          },
        },
        {
          $set: {
            status: "read",

            readAt:
              new Date(),
          },
        },
        {
          new: true,
        }
      ).lean();

    return formatMessage(
      message
    );
  };

// ============================================
// MARK CONVERSATION READ
// ============================================

const markConversationRead =
  async ({
    userId,
    otherUserId,
  }) => {
    if (!isValidObjectId(userId)) {
      throw new Error(
        "Invalid user ID"
      );
    }

    if (
      !isValidObjectId(
        otherUserId
      )
    ) {
      throw new Error(
        "Invalid other user ID"
      );
    }

    const now =
      new Date();

    await Message.updateMany(
      {
        senderId:
          otherUserId,

        receiverId:
          userId,

        status: {
          $in: [
            "sent",
            "delivered",
          ],
        },
      },
      {
        $set: {
          status: "read",

          readAt: now,
        },
      }
    );

    return true;
  };

module.exports = {
  saveMessage,
  getChatHistory,
  getMessagesAfter,
  getOfflineMessages,
  markDelivered,
  markMessagesDelivered,
  markMessageRead,
  markConversationRead,
  formatMessage,
};