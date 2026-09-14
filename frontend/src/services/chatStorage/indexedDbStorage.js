const DB_NAME =
  "taskflow-chat";

const DB_VERSION = 1;

const MESSAGE_STORE =
  "messages";

const META_STORE =
  "metadata";

// ============================================
// OPEN DATABASE
// ============================================

const openDatabase = () => {
  return new Promise(
    (resolve, reject) => {
      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        );

      request.onupgradeneeded =
        () => {
          const db =
            request.result;

          // ====================================
          // MESSAGES
          // ====================================

          if (
            !db.objectStoreNames.contains(
              MESSAGE_STORE
            )
          ) {
            const store =
              db.createObjectStore(
                MESSAGE_STORE,
                {
                  keyPath:
                    "localKey",
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

          // ====================================
          // METADATA
          // ====================================

          if (
            !db.objectStoreNames.contains(
              META_STORE
            )
          ) {
            db.createObjectStore(
              META_STORE,
              {
                keyPath:
                  "key",
              }
            );
          }
        };

      request.onsuccess =
        () => {
          resolve(
            request.result
          );
        };

      request.onerror =
        () => {
          reject(
            request.error
          );
        };
    }
  );
};

// ============================================
// NORMALIZE MESSAGE
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
      null;

    const text =
      message.text ??
      message.message ??
      "";

    const createdAt =
      message.createdAt ??
      message.created_at ??
      new Date().toISOString();

    const deliveredAt =
      message.deliveredAt ??
      message.delivered_at ??
      null;

    const readAt =
      message.readAt ??
      message.read_at ??
      null;

    const conversationKey =
      createConversationKey(
        ownerId,
        senderId === String(ownerId)
          ? receiverId
          : senderId
      );

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

      deliveredAt,

      readAt,

      conversationKey,
    };
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
// GET ALL MESSAGES
// ============================================

const getAllMessages =
  async () => {
    const db =
      await openDatabase();

    return new Promise(
      (
        resolve,
        reject
      ) => {
        const tx =
          db.transaction(
            MESSAGE_STORE,
            "readonly"
          );

        const store =
          tx.objectStore(
            MESSAGE_STORE
          );

        const request =
          store.getAll();

        request.onsuccess =
          () => {
            resolve(
              request.result
            );
          };

        request.onerror =
          () => {
            reject(
              request.error
            );
          };

        tx.oncomplete =
          () => {
            db.close();
          };
      }
    );
  };

// ============================================
// SAVE MESSAGE
// ============================================

const saveMessage =
  async (
    ownerId,
    message
  ) => {
    const normalized =
      normalizeMessage(
        message,
        ownerId
      );

    const db =
      await openDatabase();

    return new Promise(
      (
        resolve,
        reject
      ) => {
        const tx =
          db.transaction(
            MESSAGE_STORE,
            "readwrite"
          );

        const store =
          tx.objectStore(
            MESSAGE_STORE
          );

        store.put(
          normalized
        );

        tx.oncomplete =
          () => {
            db.close();

            resolve(
              normalized
            );
          };

        tx.onerror =
          () => {
            db.close();

            reject(
              tx.error
            );
          };
      }
    );
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

    const normalizedMessages =
      messages.map(
        (message) =>
          normalizeMessage(
            message,
            ownerId
          )
      );

    const db =
      await openDatabase();

    return new Promise(
      (
        resolve,
        reject
      ) => {
        const tx =
          db.transaction(
            MESSAGE_STORE,
            "readwrite"
          );

        const store =
          tx.objectStore(
            MESSAGE_STORE
          );

        normalizedMessages.forEach(
          (message) => {
            store.put(
              message
            );
          }
        );

        tx.oncomplete =
          () => {
            db.close();

            resolve(
              normalizedMessages
            );
          };

        tx.onerror =
          () => {
            db.close();

            reject(
              tx.error
            );
          };
      }
    );
  };

// ============================================
// GET CONVERSATION
// ============================================

const getMessages =
  async (
    ownerId,
    otherUserId
  ) => {
    const all =
      await getAllMessages();

    const key =
      createConversationKey(
        ownerId,
        otherUserId
      );

    return all
      .filter(
        (message) =>
          message.ownerId ===
            String(ownerId) &&
          message.conversationKey ===
            key
      )
      .sort(
        (
          a,
          b
        ) =>
          new Date(
            a.createdAt
          ).getTime() -
          new Date(
            b.createdAt
          ).getTime()
      );
  };

// ============================================
// GET PENDING OUTGOING
// ============================================

const getPendingMessages =
  async (
    ownerId
  ) => {
    const all =
      await getAllMessages();

    return all
      .filter(
        (message) =>
          message.ownerId ===
            String(ownerId) &&
          message.senderId ===
            String(ownerId) &&
          (
            message.status ===
              "pending" ||
            message.status ===
              "failed"
          )
      )
      .sort(
        (
          a,
          b
        ) =>
          new Date(
            a.createdAt
          ).getTime() -
          new Date(
            b.createdAt
          ).getTime()
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
// FIND BY CLIENT MESSAGE ID
// ============================================

const findByClientMessageId =
  async (
    ownerId,
    clientMessageId
  ) => {
    const all =
      await getAllMessages();

    return (
      all.find(
        (message) =>
          message.ownerId ===
            String(ownerId) &&
          message.clientMessageId ===
            clientMessageId
      ) || null
    );
  };

// ============================================
// FIND BY MESSAGE ID
// ============================================

const findByMessageId =
  async (
    ownerId,
    messageId
  ) => {
    const all =
      await getAllMessages();

    return (
      all.find(
        (message) =>
          message.ownerId ===
            String(ownerId) &&
          message.messageId ===
            messageId
      ) || null
    );
  };

// ============================================
// GET LAST SERVER SYNC
// ============================================

const getLastSync =
  async (
    ownerId,
    otherUserId
  ) => {
    const db =
      await openDatabase();

    const key =
      `sync:${ownerId}:${otherUserId}`;

    return new Promise(
      (
        resolve,
        reject
      ) => {
        const tx =
          db.transaction(
            META_STORE,
            "readonly"
          );

        const store =
          tx.objectStore(
            META_STORE
          );

        const request =
          store.get(key);

        request.onsuccess =
          () => {
            resolve(
              request.result
                ?.value || null
            );
          };

        request.onerror =
          () => {
            reject(
              request.error
            );
          };

        tx.oncomplete =
          () => {
            db.close();
          };
      }
    );
  };

// ============================================
// SET LAST SERVER SYNC
// ============================================

const setLastSync =
  async (
    ownerId,
    otherUserId,
    value
  ) => {
    const db =
      await openDatabase();

    const key =
      `sync:${ownerId}:${otherUserId}`;

    return new Promise(
      (
        resolve,
        reject
      ) => {
        const tx =
          db.transaction(
            META_STORE,
            "readwrite"
          );

        const store =
          tx.objectStore(
            META_STORE
          );

        store.put({
          key,

          value,
        });

        tx.oncomplete =
          () => {
            db.close();

            resolve();
          };

        tx.onerror =
          () => {
            db.close();

            reject(
              tx.error
            );
          };
      }
    );
  };

// ============================================
// CLEAR USER DATA
// ============================================

const clearUser =
  async (
    ownerId
  ) => {
    const all =
      await getAllMessages();

    const userMessages =
      all.filter(
        (message) =>
          message.ownerId ===
          String(ownerId)
      );

    if (
      userMessages.length ===
      0
    ) {
      return;
    }

    const db =
      await openDatabase();

    return new Promise(
      (
        resolve,
        reject
      ) => {
        const tx =
          db.transaction(
            MESSAGE_STORE,
            "readwrite"
          );

        const store =
          tx.objectStore(
            MESSAGE_STORE
          );

        userMessages.forEach(
          (message) => {
            store.delete(
              message.localKey
            );
          }
        );

        tx.oncomplete =
          () => {
            db.close();

            resolve();
          };

        tx.onerror =
          () => {
            db.close();

            reject(
              tx.error
            );
          };
      }
    );
  };

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
};