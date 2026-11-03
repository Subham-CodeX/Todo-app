import ChatStorage from "./chatStorage/chatStorage";

import {
  getChatMessages,
  sendMessageApi,
} from "./messageApi";

// ============================================
// GENERATE CLIENT MESSAGE ID
// ============================================

const generateClientMessageId =
  () => {
    if (
      globalThis.crypto &&
      typeof globalThis.crypto
        .randomUUID ===
        "function"
    ) {
      return globalThis.crypto.randomUUID();
    }

    return (
      `${Date.now()}-` +
      `${Math.random()
        .toString(36)
        .slice(2)}`
    );
  };

// ============================================
// CREATE LOCAL MESSAGE
// ============================================

export const createLocalMessage =
  async ({
    ownerId,
    receiverId,
    text,
  }) => {
    const clientMessageId =
      generateClientMessageId();

    const now =
      new Date().toISOString();

    const localMessage = {
      messageId:
        null,

      clientMessageId,

      senderId:
        String(ownerId),

      receiverId:
        String(receiverId),

      text:
        String(text).trim(),

      status:
        "pending",

      createdAt:
        now,

      deliveredAt:
        null,

      readAt:
        null,
    };

    return ChatStorage.saveMessage(
      ownerId,
      localMessage
    );
  };

// ============================================
// SYNC ONE CONVERSATION
// ============================================


const SYNC_BATCH_SIZE = 200;

// ============================================
// PARSE STORED CURSOR
// ============================================

const parseSyncCursor = (value) => {
  if (!value) return null;

  try {
    const cursor = JSON.parse(value);

    if (
      cursor?.createdAt &&
      cursor?.id
    ) {
      return cursor;
    }
  } catch {
    // Legacy timestamp-only cursor.
  }

  // Reset legacy cursor safely.
  // A first sync fetches the latest 100 messages.
  return null;
};

// ============================================
// SYNC ONE CONVERSATION
// ============================================

export const syncConversation = async ({
  ownerId,
  otherUserId,
}) => {
  try {
    let storedCursor = await ChatStorage.getLastSync(
      ownerId,
      otherUserId
    );

    let cursor = parseSyncCursor(storedCursor);

    let allMessages = [];

    // First synchronization.
    if (!cursor) {
      const messages = await getChatMessages(
        otherUserId,
        {
          limit: 100,
        }
      );

      if (messages.length > 0) {
        await ChatStorage.saveMessages(
          ownerId,
          messages
        );

        const latest = messages[messages.length - 1];

        const createdAt =
          latest.createdAt ??
          latest.created_at;

        const id = latest.id;

        if (createdAt && id) {
          cursor = {
            createdAt,
            id,
          };

          await ChatStorage.setLastSync(
            ownerId,
            otherUserId,
            JSON.stringify(cursor)
          );
        }

        allMessages.push(...messages);
      }

      return allMessages;
    }

    // Incremental synchronization.
    while (true) {
      const messages = await getChatMessages(
        otherUserId,
        {
          limit: SYNC_BATCH_SIZE,
          afterCreatedAt: cursor.createdAt,
          afterId: cursor.id,
        }
      );

      if (!messages.length) {
        break;
      }

      await ChatStorage.saveMessages(
        ownerId,
        messages
      );

      allMessages.push(...messages);

      const latest = messages[messages.length - 1];

      const createdAt =
        latest.createdAt ??
        latest.created_at;

      const id = latest.id;

      if (!createdAt || !id) {
        throw new Error(
          "Server message is missing synchronization cursor fields"
        );
      }

      const nextCursor = {
        createdAt,
        id,
      };

      // Move cursor forward only after persistence succeeds.
      cursor = nextCursor;

      await ChatStorage.setLastSync(
        ownerId,
        otherUserId,
        JSON.stringify(cursor)
      );

      if (messages.length < SYNC_BATCH_SIZE) {
        break;
      }
    }

    return allMessages;

  } catch (error) {
    console.error(
      "Conversation synchronization failed:",
      error
    );

    throw error;
  }
};


// ============================================
// SEND ONE PENDING MESSAGE
// ============================================

const sendPendingMessage =
  async (
    ownerId,
    localMessage
  ) => {
    try {
      console.log(
        "📤 Syncing pending message:",
        localMessage.clientMessageId
      );

      const serverMessage =
        await sendMessageApi(
          localMessage.receiverId,
          {
            text:
              localMessage.text,

            clientMessageId:
              localMessage.clientMessageId,
          }
        );

      if (
        !serverMessage
      ) {
        throw new Error(
          "Server returned no message"
        );
      }

      // ======================================
      // IMPORTANT
      //
      // Replace local pending record with
      // MongoDB version.
      // ======================================

      await ChatStorage.updateMessage(
        ownerId,
        serverMessage
      );

      return serverMessage;

    } catch (error) {
      console.error(
        "❌ Pending message sync failed:",
        error
      );

      // ======================================
      // KEEP IT FAILED LOCALLY
      //
      // It can be retried later.
      // ======================================

      await ChatStorage.updateMessage(
        ownerId,
        {
          ...localMessage,

          status:
            "failed",
        }
      );

      return null;
    }
  };

// ============================================
// SYNC PENDING OUTGOING
// ============================================

export const syncPendingMessages =
  async (
    ownerId
  ) => {
    if (
      !navigator.onLine
    ) {
      return [];
    }

    const pending =
      await ChatStorage.getPendingMessages(
        ownerId
      );

    if (
      pending.length === 0
    ) {
      return [];
    }

    const synced = [];

    for (
      const localMessage of pending
    ) {
      const result =
        await sendPendingMessage(
          ownerId,
          localMessage
        );

      if (result) {
        synced.push(
          result
        );
      }
    }

    return synced;
  };

// ============================================
// FULL CHAT SYNC
// ============================================

export const syncChat =
  async ({
    ownerId,
    otherUserId,
  }) => {
    if (
      !navigator.onLine
    ) {
      return {
        online: false,

        messages: [],
      };
    }

    // ========================================
    // PENDING FIRST
    // ========================================

    await syncPendingMessages(
      ownerId
    );

    // ========================================
    // SERVER → LOCAL
    // ========================================

    const messages =
      await syncConversation({
        ownerId,
        otherUserId,
      });

    return {
      online: true,

      messages,
    };
  };

// ============================================
// GLOBAL PENDING SYNC
// ============================================

export const syncAllPending =
  async (
    ownerId
  ) => {
    if (
      !navigator.onLine
    ) {
      return [];
    }

    try {
      return await syncPendingMessages(
        ownerId
      );
    } catch (error) {
      console.error(
        "Global pending sync failed:",
        error
      );

      return [];
    }
  };