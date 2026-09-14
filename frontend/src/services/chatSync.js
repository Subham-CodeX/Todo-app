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

export const syncConversation =
  async ({
    ownerId,
    otherUserId,
  }) => {
    const lastSync =
      await ChatStorage.getLastSync(
        ownerId,
        otherUserId
      );

    let messages = [];

    // ========================================
    // FIRST SYNC
    // ========================================

    if (!lastSync) {
      messages =
        await getChatMessages(
          otherUserId,
          {
            limit: 100,
          }
        );
    }

    // ========================================
    // INCREMENTAL SYNC
    // ========================================

    else {
      messages =
        await getChatMessages(
          otherUserId,
          {
            after:
              lastSync,

            limit: 200,
          }
        );
    }

    // ========================================
    // SAVE SERVER MESSAGES
    // ========================================

    if (
      messages.length > 0
    ) {
      await ChatStorage.saveMessages(
        ownerId,
        messages
      );

      // ======================================
      // UPDATE CURSOR
      // ======================================

      const latest =
        messages[
          messages.length - 1
        ];

      const latestDate =
        latest.createdAt ??
        latest.created_at;

      if (latestDate) {
        await ChatStorage.setLastSync(
          ownerId,
          otherUserId,
          latestDate
        );
      }
    }

    // ========================================
    // FIRST EMPTY SYNC
    // ========================================

    else if (!lastSync) {
      await ChatStorage.setLastSync(
        ownerId,
        otherUserId,
        new Date().toISOString()
      );
    }

    return messages;
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