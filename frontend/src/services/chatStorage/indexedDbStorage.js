
const DB_NAME = "taskflow-chat";
const DB_VERSION = 1;

const MESSAGE_STORE = "messages";
const META_STORE = "metadata";


// ============================================
// MESSAGE STATUS PRIORITY
// ============================================

const statusPriority = {
  pending: 0,
  failed: 0,
  sending: 1,
  sent: 2,
  delivered: 3,
  read: 4,
};


// ============================================
// MERGE MESSAGE STATUS
// ============================================

const mergeMessageStatus = (
  existingStatus,
  incomingStatus
) => {
  const existing =
    statusPriority[existingStatus] ?? 0;

  const incoming =
    statusPriority[incomingStatus] ?? 0;

  // Never downgrade an existing status.
  return incoming > existing
    ? incomingStatus
    : existingStatus || incomingStatus || "pending";
};


// ============================================
// MERGE STORED MESSAGE
// ============================================

const mergeStoredMessage = (
  existing,
  incoming
) => {

  if (!existing) {
    return incoming;
  }

  const existingStatus =
    existing.status || "pending";

  const incomingStatus =
    incoming.status || "pending";

  return {
    ...existing,
    ...incoming,

    // Preserve the most advanced status.
    status: mergeMessageStatus(
      existingStatus,
      incomingStatus
    ),

    // Preserve server message identity.
    messageId:
      incoming.messageId ||
      existing.messageId ||
      null,

    // Preserve client-generated identity.
    clientMessageId:
      incoming.clientMessageId ||
      existing.clientMessageId ||
      null,

    // Preserve original creation time.
    createdAt:
      existing.createdAt ||
      incoming.createdAt,

    // Preserve delivery timestamp.
    deliveredAt:
      incoming.deliveredAt ||
      existing.deliveredAt ||
      null,

    // Preserve read timestamp.
    readAt:
      incoming.readAt ||
      existing.readAt ||
      null,

    // Preserve synchronization state.
    synced:
      incoming.synced === true ||
      existing.synced === true,

    localKey:
      existing.localKey ||
      incoming.localKey,
  };
};


// ============================================
// OPEN DATABASE
// ============================================

const openDatabase = () => {

  return new Promise((resolve, reject) => {

    if (
      typeof indexedDB === "undefined"
    ) {
      reject(
        new Error("IndexedDB is not supported")
      );

      return;
    }

    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = () => {

      const db = request.result;

      // ======================================
      // MESSAGE STORE
      // ======================================

      if (
        !db.objectStoreNames.contains(
          MESSAGE_STORE
        )
      ) {

        const store = db.createObjectStore(
          MESSAGE_STORE,
          {
            keyPath: "localKey",
          }
        );

        store.createIndex(
          "ownerId",
          "ownerId",
          {
            unique: false,
          }
        );

        store.createIndex(
          "conversationKey",
          "conversationKey",
          {
            unique: false,
          }
        );

        store.createIndex(
          "clientMessageId",
          "clientMessageId",
          {
            unique: false,
          }
        );

        store.createIndex(
          "createdAt",
          "createdAt",
          {
            unique: false,
          }
        );

        store.createIndex(
          "status",
          "status",
          {
            unique: false,
          }
        );

      }

      // ======================================
      // METADATA STORE
      // ======================================

      if (
        !db.objectStoreNames.contains(
          META_STORE
        )
      ) {

        db.createObjectStore(
          META_STORE,
          {
            keyPath: "key",
          }
        );

      }

    };

    request.onsuccess = () => {

      const db = request.result;

      db.onversionchange = () => {
        db.close();
      };

      resolve(db);

    };

    request.onerror = () => {
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn(
        "IndexedDB upgrade blocked by another open connection"
      );
    };

  });

};


// ============================================
// CREATE CONVERSATION KEY
// ============================================

const createConversationKey = (
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
// NORMALIZE MESSAGE
// ============================================

const normalizeMessage = (
  message,
  ownerId
) => {

  if (
    !message ||
    typeof message !== "object"
  ) {
    throw new Error("Invalid message");
  }

  const senderId = String(
    message.senderId ??
    message.sender_id ??
    ""
  );

  const receiverId = String(
    message.receiverId ??
    message.receiver_id ??
    ""
  );

  if (!senderId || !receiverId) {
    throw new Error(
      "Message requires senderId and receiverId"
    );
  }

  const messageId =
    message.messageId ??
    message.message_id ??
    message.id ??
    null;

  const clientMessageId =
    message.clientMessageId ??
    message.client_message_id ??
    null;

  // Never generate a new random ID for
  // existing server messages.

  const stableId =
    clientMessageId ||
    messageId;

  if (!stableId) {
    throw new Error(
      "Message requires clientMessageId or messageId"
    );
  }

  const text =
    message.text ??
    message.message ??
    "";

  const createdAt =
    message.createdAt ??
    message.created_at ??
    new Date().toISOString();

  const conversationKey =
    createConversationKey(
      ownerId,
      senderId === String(ownerId)
        ? receiverId
        : senderId
    );

  return {

    // Preserve additional message fields.
    ...message,

    // ======================================
    // LOCAL IDENTIFIERS
    // ======================================

    localKey:
      `${String(ownerId)}:${String(stableId)}`,

    ownerId: String(ownerId),

    messageId:
      messageId
        ? String(messageId)
        : null,

    clientMessageId:
      clientMessageId
        ? String(clientMessageId)
        : null,

    // ======================================
    // PARTICIPANTS
    // ======================================

    senderId,

    receiverId,

    // ======================================
    // MESSAGE CONTENT
    // ======================================

    text,

    // ======================================
    // DELIVERY STATUS
    // ======================================

    status:
      message.status || "sent",

    createdAt,

    deliveredAt:
      message.deliveredAt ??
      message.delivered_at ??
      null,

    readAt:
      message.readAt ??
      message.read_at ??
      null,

    // ======================================
    // CONVERSATION
    // ======================================

    conversationKey,

  };

};


// ============================================
// MERGE AND STORE MESSAGE
// ============================================

// This helper also handles an older record
// whose localKey differs but has the same
// clientMessageId.

const putMergedMessage = (
  store,
  incoming,
  ownerId
) => {

  const localRequest = store.get(
    incoming.localKey
  );

  localRequest.onsuccess = () => {

    const existing = localRequest.result;

    if (existing) {

      const merged = mergeStoredMessage(
        existing,
        incoming
      );

      store.put(merged);

      return;

    }

    // ======================================
    // FALLBACK: SEARCH CLIENT MESSAGE ID
    // ======================================

    if (!incoming.clientMessageId) {

      store.put(incoming);

      return;

    }

    const index = store.index(
      "clientMessageId"
    );

    const clientRequest = index.getAll(
      incoming.clientMessageId
    );

    clientRequest.onsuccess = () => {

      const matches = (
        clientRequest.result || []
      ).filter(
        (record) =>
          record.ownerId === String(ownerId)
      );

      const previous = matches[0] || null;

      const merged = mergeStoredMessage(
        previous,
        incoming
      );

      // Remove duplicate old local records.
      matches.forEach((record) => {

        if (
          record.localKey !== incoming.localKey
        ) {
          store.delete(record.localKey);
        }

      });

      store.put(merged);

    };

  };

};


// ============================================
// GET ALL MESSAGES
// ============================================

const getAllMessages = async () => {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(
      MESSAGE_STORE,
      "readonly"
    );

    const store = tx.objectStore(
      MESSAGE_STORE
    );

    const request = store.getAll();

    let results = [];

    request.onsuccess = () => {
      results = request.result || [];
    };

    tx.oncomplete = () => {

      db.close();

      resolve(results);

    };

    tx.onerror = () => {

      db.close();

      reject(tx.error);

    };

    tx.onabort = () => {

      db.close();

      reject(
        tx.error ||
        new Error("IndexedDB read aborted")
      );

    };

  });

};


// ============================================
// SAVE SINGLE MESSAGE
// ============================================

const saveMessage = async (
  ownerId,
  message
) => {

  const normalized = normalizeMessage(
    message,
    ownerId
  );

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(
      MESSAGE_STORE,
      "readwrite"
    );

    const store = tx.objectStore(
      MESSAGE_STORE
    );

    let result = normalized;

    const request = store.get(
      normalized.localKey
    );

    request.onsuccess = () => {

      const existing = request.result;

      if (existing) {

        result = mergeStoredMessage(
          existing,
          normalized
        );

        store.put(result);

        return;

      }

      // ==================================
      // FALLBACK BY CLIENT MESSAGE ID
      // ==================================

      if (!normalized.clientMessageId) {

        store.put(normalized);

        return;

      }

      const index = store.index(
        "clientMessageId"
      );

      const clientRequest = index.getAll(
        normalized.clientMessageId
      );

      clientRequest.onsuccess = () => {

        const matches = (
          clientRequest.result || []
        ).filter(
          (record) =>
            record.ownerId === String(ownerId)
        );

        const previous = matches[0] || null;

        result = mergeStoredMessage(
          previous,
          normalized
        );

        matches.forEach((record) => {

          if (
            record.localKey !== normalized.localKey
          ) {
            store.delete(record.localKey);
          }

        });

        store.put(result);

      };

    };

    request.onerror = () => {
      tx.abort();
    };

    tx.oncomplete = () => {

      db.close();

      resolve(result);

    };

    tx.onerror = () => {

      db.close();

      reject(tx.error);

    };

    tx.onabort = () => {

      db.close();

      reject(
        tx.error ||
        new Error("Message save aborted")
      );

    };

  });

};


// ============================================
// SAVE MANY MESSAGES
// STATUS-AWARE BULK MERGING
// ============================================

const saveMessages = async (
  ownerId,
  messages
) => {

  if (
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    return [];
  }

  // ======================================
  // NORMALIZE MESSAGES
  // ======================================

  const normalizedMessages = messages.map(
    (message) =>
      normalizeMessage(
        message,
        ownerId
      )
  );

  // ======================================
  // REMOVE DUPLICATES IN CURRENT BATCH
  // ======================================

  const uniqueMessages = new Map();

  normalizedMessages.forEach((message) => {

    const existing = uniqueMessages.get(
      message.localKey
    );

    uniqueMessages.set(
      message.localKey,
      mergeStoredMessage(
        existing,
        message
      )
    );

  });

  const batch = Array.from(
    uniqueMessages.values()
  );

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const tx = db.transaction(
      MESSAGE_STORE,
      "readwrite"
    );

    const store = tx.objectStore(
      MESSAGE_STORE
    );

    const results = new Array(batch.length);

    batch.forEach((incoming, index) => {

      const request = store.get(
        incoming.localKey
      );

      request.onsuccess = () => {

        const existing = request.result;

        if (existing) {

          const merged = mergeStoredMessage(
            existing,
            incoming
          );

          results[index] = merged;

          store.put(merged);

          return;

        }

        // ==================================
        // FALLBACK CLIENT ID LOOKUP
        // ==================================

        if (!incoming.clientMessageId) {

          results[index] = incoming;

          store.put(incoming);

          return;

        }

        const clientRequest = store
          .index("clientMessageId")
          .getAll(incoming.clientMessageId);

        clientRequest.onsuccess = () => {

          const matches = (
            clientRequest.result || []
          ).filter(
            (record) =>
              record.ownerId === String(ownerId)
          );

          const previous = matches[0] || null;

          const merged = mergeStoredMessage(
            previous,
            incoming
          );

          matches.forEach((record) => {

            if (
              record.localKey !== incoming.localKey
            ) {
              store.delete(record.localKey);
            }

          });

          results[index] = merged;

          store.put(merged);

        };

      };

      request.onerror = () => {
        tx.abort();
      };

    });

    tx.oncomplete = () => {

      db.close();

      resolve(results);

    };

    tx.onerror = () => {

      db.close();

      reject(tx.error);

    };

    tx.onabort = () => {

      db.close();

      reject(
        tx.error ||
        new Error("IndexedDB bulk save aborted")
      );

    };

  });

};


// ============================================
// GET CONVERSATION MESSAGES
// ============================================

const getMessages = async (
  ownerId,
  otherUserId
) => {

  const all = await getAllMessages();

  const key = createConversationKey(
    ownerId,
    otherUserId
  );

  return all
    .filter(
      (message) =>
        message.ownerId === String(ownerId) &&
        message.conversationKey === key
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );

};


// ============================================
// GET PENDING OUTGOING MESSAGES
// ============================================

const getPendingMessages = async (
  ownerId
) => {

  const all = await getAllMessages();

  return all
    .filter(
      (message) =>
        message.ownerId === String(ownerId) &&
        message.senderId === String(ownerId) &&
        (
          message.status === "pending" ||
          message.status === "sending" ||
          message.status === "failed"
        )
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );

};


// ============================================
// UPDATE MESSAGE
// ============================================

const updateMessage = async (
  ownerId,
  message
) => {

  return saveMessage(
    ownerId,
    message
  );

};


// ============================================
// FIND BY CLIENT MESSAGE ID
// ============================================

const findByClientMessageId = async (
  ownerId,
  clientMessageId
) => {

  const all = await getAllMessages();

  return (
    all.find(
      (message) =>
        message.ownerId === String(ownerId) &&
        message.clientMessageId === String(clientMessageId)
    ) || null
  );

};


// ============================================
// FIND BY SERVER MESSAGE ID
// ============================================

const findByMessageId = async (
  ownerId,
  messageId
) => {

  const all = await getAllMessages();

  return (
    all.find(
      (message) =>
        message.ownerId === String(ownerId) &&
        message.messageId === String(messageId)
    ) || null
  );

};


// ============================================
// GET LAST SERVER SYNC
// ============================================

const getLastSync = async (
  ownerId,
  otherUserId
) => {

  const db = await openDatabase();

  const key =
    `sync:${ownerId}:${otherUserId}`;

  return new Promise((resolve, reject) => {

    const tx = db.transaction(
      META_STORE,
      "readonly"
    );

    const store = tx.objectStore(
      META_STORE
    );

    const request = store.get(key);

    let result = null;

    request.onsuccess = () => {

      result =
        request.result?.value ?? null;

    };

    tx.oncomplete = () => {

      db.close();

      resolve(result);

    };

    tx.onerror = () => {

      db.close();

      reject(tx.error);

    };

    tx.onabort = () => {

      db.close();

      reject(tx.error);

    };

  });

};


// ============================================
// SET LAST SERVER SYNC
// ============================================

const setLastSync = async (
  ownerId,
  otherUserId,
  value
) => {

  const db = await openDatabase();

  const key =
    `sync:${ownerId}:${otherUserId}`;

  return new Promise((resolve, reject) => {

    const tx = db.transaction(
      META_STORE,
      "readwrite"
    );

    const store = tx.objectStore(
      META_STORE
    );

    store.put({
      key,
      value,
    });

    tx.oncomplete = () => {

      db.close();

      resolve();

    };

    tx.onerror = () => {

      db.close();

      reject(tx.error);

    };

    tx.onabort = () => {

      db.close();

      reject(tx.error);

    };

  });

};


// ============================================
// CLEAR USER DATA
// ============================================

const clearUser = async (ownerId) => {

  const db = await openDatabase();

  const owner = String(ownerId);

  return new Promise((resolve, reject) => {

    const tx = db.transaction(
      [MESSAGE_STORE, META_STORE],
      "readwrite"
    );

    const messageStore = tx.objectStore(
      MESSAGE_STORE
    );

    const metadataStore = tx.objectStore(
      META_STORE
    );

    // ======================================
    // DELETE USER MESSAGES
    // ======================================

    const request = messageStore
      .index("ownerId")
      .openCursor(
        IDBKeyRange.only(owner)
      );

    request.onsuccess = () => {

      const cursor = request.result;

      if (cursor) {

        cursor.delete();

        cursor.continue();

      }

    };

    // ======================================
    // DELETE USER SYNC METADATA
    // ======================================

    const metadataRequest =
      metadataStore.openCursor();

    metadataRequest.onsuccess = () => {

      const cursor = metadataRequest.result;

      if (cursor) {

        if (
          cursor.value.key.startsWith(
            `sync:${owner}:`
          )
        ) {

          cursor.delete();

        }

        cursor.continue();

      }

    };

    tx.oncomplete = () => {

      db.close();

      resolve();

    };

    tx.onerror = () => {

      db.close();

      reject(tx.error);

    };

    tx.onabort = () => {

      db.close();

      reject(
        tx.error ||
        new Error("User data deletion aborted")
      );

    };

  });

};


// ============================================
// EXPORT FUNCTIONS
// ============================================

export {
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

  mergeMessageStatus,
};
