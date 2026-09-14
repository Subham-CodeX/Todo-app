import { Capacitor } from "@capacitor/core";

import * as indexedDbStorage
  from "./indexedDbStorage";

import * as androidSqliteStorage
  from "./androidSqliteStorage";

// ============================================
// PLATFORM
// ============================================

const isAndroid =
  Capacitor.getPlatform() ===
  "android";

// ============================================
// ACTIVE STORAGE
// ============================================

const storage =
  isAndroid
    ? androidSqliteStorage
    : indexedDbStorage;

// ============================================
// PUBLIC API
// ============================================

const ChatStorage = {
  initialize:
    async () => {
      if (
        storage.initializeDatabase
      ) {
        return storage.initializeDatabase();
      }

      return null;
    },

  saveMessage:
    (
      ownerId,
      message
    ) =>
      storage.saveMessage(
        ownerId,
        message
      ),

  saveMessages:
    (
      ownerId,
      messages
    ) =>
      storage.saveMessages(
        ownerId,
        messages
      ),

  getMessages:
    (
      ownerId,
      otherUserId
    ) =>
      storage.getMessages(
        ownerId,
        otherUserId
      ),

  getPendingMessages:
    (ownerId) =>
      storage.getPendingMessages(
        ownerId
      ),

  updateMessage:
    (
      ownerId,
      message
    ) =>
      storage.updateMessage(
        ownerId,
        message
      ),

  findByClientMessageId:
    (
      ownerId,
      clientMessageId
    ) =>
      storage.findByClientMessageId(
        ownerId,
        clientMessageId
      ),

  findByMessageId:
    (
      ownerId,
      messageId
    ) =>
      storage.findByMessageId(
        ownerId,
        messageId
      ),

  getLastSync:
    (
      ownerId,
      otherUserId
    ) =>
      storage.getLastSync(
        ownerId,
        otherUserId
      ),

  setLastSync:
    (
      ownerId,
      otherUserId,
      value
    ) =>
      storage.setLastSync(
        ownerId,
        otherUserId,
        value
      ),

  clearUser:
    (ownerId) =>
      storage.clearUser(
        ownerId
      ),
};

// ============================================
// EXPORT
// ============================================

export default ChatStorage;