const crypto =
  require(
    "crypto"
  );


const db =
  require(
    "../database/chatDatabase"
  );


// ==========================================
// SAVE MESSAGE
// ==========================================

function saveMessage({

  senderId,

  receiverId,

  message,

}) {

  // ========================================
  // VALIDATION
  // ========================================

  if (
    !senderId
  ) {

    throw new Error(
      "Sender ID is required"
    );

  }


  if (
    !receiverId
  ) {

    throw new Error(
      "Receiver ID is required"
    );

  }


  if (
    !message ||
    !message.trim()
  ) {

    throw new Error(
      "Message cannot be empty"
    );

  }


  // ========================================
  // GENERATE MESSAGE ID
  // ========================================

  const messageId =
    crypto.randomUUID();


  // ========================================
  // INSERT MESSAGE
  // ========================================

  const statement =
    db.prepare(`

      INSERT INTO messages (

        message_id,

        sender_id,

        receiver_id,

        message,

        status

      )

      VALUES (

        ?,
        ?,
        ?,
        ?,
        ?

      )

    `);


  statement.run(

    messageId,

    senderId,

    receiverId,

    message.trim(),

    "sent"

  );


  // ========================================
  // GET SAVED MESSAGE
  // ========================================

  const savedMessage =
    db

      .prepare(`

        SELECT

          message_id,

          sender_id,

          receiver_id,

          message,

          status,

          created_at,

          delivered_at,

          read_at

        FROM messages

        WHERE message_id = ?

      `)

      .get(
        messageId
      );


  if (
    !savedMessage
  ) {

    throw new Error(
      "Failed to save message"
    );

  }


  return formatMessage(
    savedMessage
  );

}


// ==========================================
// GET CHAT HISTORY
// ==========================================

function getChatHistory({

  userId,

  otherUserId,

  limit = 100,

}) {

  // ========================================
  // VALIDATION
  // ========================================

  if (
    !userId
  ) {

    throw new Error(
      "User ID is required"
    );

  }


  if (
    !otherUserId
  ) {

    throw new Error(
      "Other user ID is required"
    );

  }


  // ========================================
  // SAFE LIMIT
  // ========================================

  const safeLimit =
    Math.min(

      Math.max(

        Number(
          limit
        ) || 100,

        1

      ),

      500

    );


  // ========================================
  // GET MESSAGES
  // ========================================

  const statement =
    db.prepare(`

      SELECT

        message_id,

        sender_id,

        receiver_id,

        message,

        status,

        created_at,

        delivered_at,

        read_at

      FROM messages

      WHERE

        (

          sender_id = ?

          AND

          receiver_id = ?

        )

        OR

        (

          sender_id = ?

          AND

          receiver_id = ?

        )

      ORDER BY

        created_at ASC

      LIMIT ?

    `);


  const messages =
    statement.all(

      userId,

      otherUserId,

      otherUserId,

      userId,

      safeLimit

    );


  return messages.map(

    (
      message
    ) =>
      formatMessage(
        message
      )

  );

}


// ==========================================
// GET OFFLINE MESSAGES
// ==========================================

function getOfflineMessages(
  userId
) {

  if (
    !userId
  ) {

    throw new Error(
      "User ID is required"
    );

  }


  const statement =
    db.prepare(`

      SELECT

        message_id,

        sender_id,

        receiver_id,

        message,

        status,

        created_at,

        delivered_at,

        read_at

      FROM messages

      WHERE

        receiver_id = ?

        AND

        status = 'sent'

      ORDER BY

        created_at ASC

    `);


  const messages =
    statement.all(
      userId
    );


  return messages.map(

    (
      message
    ) =>
      formatMessage(
        message
      )

  );

}


// ==========================================
// MARK SINGLE MESSAGE DELIVERED
// ==========================================

function markDelivered(
  messageId
) {

  if (
    !messageId
  ) {

    return;

  }


  const statement =
    db.prepare(`

      UPDATE messages

      SET

        status = 'delivered',

        delivered_at =
          CURRENT_TIMESTAMP

      WHERE

        message_id = ?

        AND

        status = 'sent'

    `);


  statement.run(
    messageId
  );

}


// ==========================================
// MARK MULTIPLE MESSAGES DELIVERED
// ==========================================

function markMessagesDelivered(
  messageIds
) {

  if (
    !Array.isArray(
      messageIds
    )
  ) {

    return;

  }


  if (
    messageIds.length ===
    0
  ) {

    return;

  }


  const validMessageIds =
    messageIds.filter(
      Boolean
    );


  if (
    validMessageIds.length ===
    0
  ) {

    return;

  }


  const placeholders =
    validMessageIds

      .map(
        () => "?"
      )

      .join(
        ","
      );


  const statement =
    db.prepare(`

      UPDATE messages

      SET

        status = 'delivered',

        delivered_at =
          CURRENT_TIMESTAMP

      WHERE

        message_id IN (

          ${placeholders}

        )

        AND

        status = 'sent'

    `);


  statement.run(
    ...validMessageIds
  );

}


// ==========================================
// MARK MESSAGE READ
// ==========================================

function markMessageRead(
  messageId
) {

  if (
    !messageId
  ) {

    return;

  }


  const statement =
    db.prepare(`

      UPDATE messages

      SET

        status = 'read',

        read_at =
          CURRENT_TIMESTAMP

      WHERE

        message_id = ?

    `);


  statement.run(
    messageId
  );

}


// ==========================================
// MARK CONVERSATION READ
// ==========================================

function markConversationRead({

  userId,

  otherUserId,

}) {

  if (
    !userId ||
    !otherUserId
  ) {

    return;

  }


  const statement =
    db.prepare(`

      UPDATE messages

      SET

        status = 'read',

        read_at =
          CURRENT_TIMESTAMP

      WHERE

        sender_id = ?

        AND

        receiver_id = ?

        AND

        status != 'read'

    `);


  statement.run(

    otherUserId,

    userId

  );

}


// ==========================================
// FORMAT MESSAGE
// ==========================================

function formatMessage(
  message
) {

  if (
    !message
  ) {

    return null;

  }


  return {

    // --------------------------------------
    // COMMON ID
    // --------------------------------------

    id:
      message.message_id,


    message_id:
      message.message_id,


    // --------------------------------------
    // SENDER
    // --------------------------------------

    senderId:
      message.sender_id,


    sender_id:
      message.sender_id,


    // --------------------------------------
    // RECEIVER
    // --------------------------------------

    receiverId:
      message.receiver_id,


    receiver_id:
      message.receiver_id,


    // --------------------------------------
    // MESSAGE CONTENT
    // --------------------------------------

    text:
      message.message,


    message:
      message.message,


    // --------------------------------------
    // STATUS
    // --------------------------------------

    status:
      message.status,


    // --------------------------------------
    // TIMESTAMPS
    // --------------------------------------

    createdAt:
      message.created_at,


    created_at:
      message.created_at,


    deliveredAt:
      message.delivered_at,


    delivered_at:
      message.delivered_at,


    readAt:
      message.read_at,


    read_at:
      message.read_at,

  };

}


// ==========================================
// EXPORTS
// ==========================================

module.exports = {

  saveMessage,

  getChatHistory,

  getOfflineMessages,

  markDelivered,

  markMessagesDelivered,

  markMessageRead,

  markConversationRead,

};