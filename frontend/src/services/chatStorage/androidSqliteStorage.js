import {
  CapacitorSQLite,
  SQLiteConnection,
} from "@capacitor-community/sqlite";

import { Capacitor } from "@capacitor/core";


// ============================================
// SQLITE
// ============================================

const crypto =
  globalThis.crypto;

const sqlite =
  new SQLiteConnection(
    CapacitorSQLite
  );

const DB_NAME =
  "taskflow_chat";

const DB_VERSION = 1;

let db = null;

// ============================================
// INITIALIZE DATABASE
// ============================================

const initializeDatabase =
  async () => {
    if (
      Capacitor.getPlatform() !==
      "android"
    ) {
      throw new Error(
        "Android SQLite storage can only be used on Android"
      );
    }

    if (db) {
      return db;
    }

    const consistency =
      await sqlite
        .checkConnectionsConsistency();

    const connected =
      await sqlite.isConnection(
        DB_NAME,
        false
      );

    if (
      consistency.result &&
      connected.result
    ) {
      db =
        await sqlite.retrieveConnection(
          DB_NAME,
          false
        );
    } else {
      db =
        await sqlite.createConnection(
          DB_NAME,
          false,
          "no-encryption",
          DB_VERSION,
          false
        );
    }

    await db.open();

    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        local_key TEXT PRIMARY KEY NOT NULL,

        owner_id TEXT NOT NULL,

        message_id TEXT,

        client_message_id TEXT NOT NULL,

        sender_id TEXT NOT NULL,

        receiver_id TEXT NOT NULL,

        text TEXT NOT NULL,

        status TEXT NOT NULL DEFAULT 'pending',

        created_at TEXT NOT NULL,

        delivered_at TEXT,

        read_at TEXT,

        conversation_key TEXT NOT NULL,

        UNIQUE(owner_id, client_message_id)
      );
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS
      idx_messages_conversation
      ON messages(
        owner_id,
        conversation_key,
        created_at
      );
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS
      idx_messages_pending
      ON messages(
        owner_id,
        status,
        sender_id
      );
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS
      idx_messages_message_id
      ON messages(
        owner_id,
        message_id
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS sync_metadata (
        sync_key TEXT PRIMARY KEY NOT NULL,

        sync_value TEXT
      );
    `);

    return db;
  };

// ============================================
// CONVERSATION KEY
// ============================================

const createConversationKey =
  (
    userA,
    userB
  ) => {
    const ids = [
      String(userA),
      String(userB),
    ].sort();

    return `${ids[0]}:${ids[1]}`;
  };

// ============================================
// NORMALIZE
// ============================================

const normalizeMessage =
  (
    message,
    ownerId
  ) => {
    const senderId =
      String(
        message.senderId ??
          message.sender_id ??
          ""
      );

    const receiverId =
      String(
        message.receiverId ??
          message.receiver_id ??
          ""
      );

    const messageId =
      message.messageId ??
      message.message_id ??
      message.id ??
      null;

    const clientMessageId =
      message.clientMessageId ??
      message.client_message_id ??
      crypto.randomUUID();

    const text =
      message.text ??
      message.message ??
      "";

    const createdAt =
      message.createdAt ??
      message.created_at ??
      new Date().toISOString();

    return {
      localKey:
        `${ownerId}:${messageId ?? clientMessageId}`,

      ownerId:
        String(ownerId),

      messageId,

      clientMessageId,

      senderId,

      receiverId,

      text,

      status:
        message.status ||
        "sent",

      createdAt,

      deliveredAt:
        message.deliveredAt ??
        message.delivered_at ??
        null,

      readAt:
        message.readAt ??
        message.read_at ??
        null,

      conversationKey:
        createConversationKey(
          ownerId,
          senderId ===
            String(ownerId)
            ? receiverId
            : senderId
        ),
    };
  };

// ============================================
// SAVE MESSAGE
// ============================================

const saveMessage =
  async (
    ownerId,
    message
  ) => {
    const database =
      await initializeDatabase();

    const normalized =
      normalizeMessage(
        message,
        ownerId
      );

    await database.run(
      `
      INSERT INTO messages (
        local_key,
        owner_id,
        message_id,
        client_message_id,
        sender_id,
        receiver_id,
        text,
        status,
        created_at,
        delivered_at,
        read_at,
        conversation_key
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
      ON CONFLICT(local_key)
      DO UPDATE SET
        message_id = excluded.message_id,
        client_message_id = excluded.client_message_id,
        text = excluded.text,
        status = excluded.status,
        created_at = excluded.created_at,
        delivered_at = excluded.delivered_at,
        read_at = excluded.read_at,
        conversation_key = excluded.conversation_key
      `,
      [
        normalized.localKey,
        normalized.ownerId,
        normalized.messageId,
        normalized.clientMessageId,
        normalized.senderId,
        normalized.receiverId,
        normalized.text,
        normalized.status,
        normalized.createdAt,
        normalized.deliveredAt,
        normalized.readAt,
        normalized.conversationKey,
      ]
    );

    return normalized;
  };

// ============================================
// SAVE MANY
// ============================================

const saveMessages =
  async (
    ownerId,
    messages
  ) => {
    if (
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      return [];
    }

    const database =
      await initializeDatabase();

    await database.beginTransaction();

    try {
      const results = [];

      for (
        const message of messages
      ) {
        const normalized =
          normalizeMessage(
            message,
            ownerId
          );

        await database.run(
          `
          INSERT INTO messages (
            local_key,
            owner_id,
            message_id,
            client_message_id,
            sender_id,
            receiver_id,
            text,
            status,
            created_at,
            delivered_at,
            read_at,
            conversation_key
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
          ON CONFLICT(local_key)
          DO UPDATE SET
            message_id = excluded.message_id,
            client_message_id = excluded.client_message_id,
            text = excluded.text,
            status = excluded.status,
            created_at = excluded.created_at,
            delivered_at = excluded.delivered_at,
            read_at = excluded.read_at,
            conversation_key = excluded.conversation_key,
            receiver_id = excluded.receiver_id,
            sender_id = excluded.sender_id
          `,
          [
            normalized.localKey,
            normalized.ownerId,
            normalized.messageId,
            normalized.clientMessageId,
            normalized.senderId,
            normalized.receiverId,
            normalized.text,
            normalized.status,
            normalized.createdAt,
            normalized.deliveredAt,
            normalized.readAt,
            normalized.conversationKey,
          ]
        );

        results.push(
          normalized
        );
      }

      await database.commitTransaction();

      return results;

    } catch (error) {
      await database.rollbackTransaction();

      throw error;
    }
  };

// ============================================
// GET CONVERSATION
// ============================================

const getMessages =
  async (
    ownerId,
    otherUserId
  ) => {
    const database =
      await initializeDatabase();

    const conversationKey =
      createConversationKey(
        ownerId,
        otherUserId
      );

    const result =
      await database.query(
        `
        SELECT
          local_key,
          owner_id,
          message_id,
          client_message_id,
          sender_id,
          receiver_id,
          text,
          status,
          created_at,
          delivered_at,
          read_at,
          conversation_key
        FROM messages
        WHERE owner_id = ?
          AND conversation_key = ?
        ORDER BY created_at ASC
        `,
        [
          String(ownerId),
          conversationKey,
        ]
      );

    return (
      result.values || []
    ).map(
      mapRow
    );
  };

// ============================================
// GET PENDING
// ============================================

const getPendingMessages =
  async (
    ownerId
  ) => {
    const database =
      await initializeDatabase();

    const result =
      await database.query(
        `
        SELECT
          local_key,
          owner_id,
          message_id,
          client_message_id,
          sender_id,
          receiver_id,
          text,
          status,
          created_at,
          delivered_at,
          read_at,
          conversation_key
        FROM messages
        WHERE owner_id = ?
          AND sender_id = ?
          AND status IN ('pending', 'failed')
        ORDER BY created_at ASC
        `,
        [
          String(ownerId),
          String(ownerId),
        ]
      );

    return (
      result.values || []
    ).map(
      mapRow
    );
  };

// ============================================
// FIND CLIENT ID
// ============================================

const findByClientMessageId =
  async (
    ownerId,
    clientMessageId
  ) => {
    const database =
      await initializeDatabase();

    const result =
      await database.query(
        `
        SELECT *
        FROM messages
        WHERE owner_id = ?
          AND client_message_id = ?
        LIMIT 1
        `,
        [
          String(ownerId),
          clientMessageId,
        ]
      );

    if (
      !result.values ||
      result.values.length === 0
    ) {
      return null;
    }

    return mapRow(
      result.values[0]
    );
  };

// ============================================
// FIND MESSAGE ID
// ============================================

const findByMessageId =
  async (
    ownerId,
    messageId
  ) => {
    const database =
      await initializeDatabase();

    const result =
      await database.query(
        `
        SELECT *
        FROM messages
        WHERE owner_id = ?
          AND message_id = ?
        LIMIT 1
        `,
        [
          String(ownerId),
          messageId,
        ]
      );

    if (
      !result.values ||
      result.values.length === 0
    ) {
      return null;
    }

    return mapRow(
      result.values[0]
    );
  };

// ============================================
// UPDATE MESSAGE
// ============================================

const updateMessage =
  async (
    ownerId,
    message
  ) => {
    return saveMessage(
      ownerId,
      message
    );
  };

// ============================================
// SYNC CURSOR
// ============================================

const getLastSync =
  async (
    ownerId,
    otherUserId
  ) => {
    const database =
      await initializeDatabase();

    const syncKey =
      `sync:${ownerId}:${otherUserId}`;

    const result =
      await database.query(
        `
        SELECT sync_value
        FROM sync_metadata
        WHERE sync_key = ?
        LIMIT 1
        `,
        [
          syncKey,
        ]
      );

    if (
      !result.values ||
      result.values.length === 0
    ) {
      return null;
    }

    return (
      result.values[0]
        .sync_value || null
    );
  };

// ============================================
// SET SYNC CURSOR
// ============================================

const setLastSync =
  async (
    ownerId,
    otherUserId,
    value
  ) => {
    const database =
      await initializeDatabase();

    const syncKey =
      `sync:${ownerId}:${otherUserId}`;

    await database.run(
      `
      INSERT INTO sync_metadata (
        sync_key,
        sync_value
      )
      VALUES (?, ?)
      ON CONFLICT(sync_key)
      DO UPDATE SET
        sync_value = excluded.sync_value
      `,
      [
        syncKey,
        value,
      ]
    );
  };

// ============================================
// CLEAR USER
// ============================================

const clearUser =
  async (
    ownerId
  ) => {
    const database =
      await initializeDatabase();

    await database.run(
      `
      DELETE FROM messages
      WHERE owner_id = ?
      `,
      [
        String(ownerId),
      ]
    );

    await database.run(
      `
      DELETE FROM sync_metadata
      WHERE sync_key LIKE ?
      `,
      [
        `sync:${ownerId}:%`,
      ]
    );
  };

// ============================================
// MAP SQLITE ROW
// ============================================

const mapRow =
  (row) => ({
    localKey:
      row.local_key,

    ownerId:
      row.owner_id,

    messageId:
      row.message_id,

    clientMessageId:
      row.client_message_id,

    senderId:
      row.sender_id,

    receiverId:
      row.receiver_id,

    text:
      row.text,

    status:
      row.status,

    createdAt:
      row.created_at,

    deliveredAt:
      row.delivered_at,

    readAt:
      row.read_at,

    conversationKey:
      row.conversation_key,
  });

export {
  initializeDatabase,
  saveMessage,
  saveMessages,
  getMessages,
  getPendingMessages,
  updateMessage,
  findByClientMessageId,
  findByMessageId,
  getLastSync,
  setLastSync,
  clearUser,
  createConversationKey,
};