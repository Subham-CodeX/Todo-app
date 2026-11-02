
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Connection = require("../models/Connection");

const {
  saveMessage,
  getOfflineMessages,
  markMessagesDelivered,
  markDelivered,
  markMessageRead,
} = require("../services/messageService");


// ==========================================
// CONFIGURATION
// ==========================================

const DELIVERY_ACK_TIMEOUT = 10000;


// ==========================================
// HELPER: SEND SOCKET ACKNOWLEDGEMENT
// ==========================================

const sendCallback = (callback, response) => {
  if (typeof callback === "function") {
    callback(response);
  }
};


// ==========================================
// INITIALIZE SOCKET SERVER
// ==========================================

module.exports = (io) => {

  // ========================================
  // SOCKET AUTHENTICATION
  // ========================================

  io.use(async (socket, next) => {

    try {

      const token = socket.handshake?.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      if (!decoded || !decoded.id) {
        return next(new Error("Invalid authentication token"));
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = {
        id: user._id.toString(),
        name: user.name,
      };

      console.log(
        `🔐 Socket authenticated: ${socket.user.id}`
      );

      next();

    } catch (error) {

      console.error(
        "Socket Authentication Error:",
        error.message
      );

      next(new Error("Invalid authentication token"));

    }

  });


  // ========================================
  // SOCKET CONNECTION
  // ========================================

  io.on("connection", async (socket) => {

    const userId = socket.user.id;

    const userRoom = `user:${userId}`;

    console.log(
      `🔌 Socket connected: ${userId}`
    );


    // ======================================
    // JOIN PERSONAL USER ROOM
    // ======================================

    socket.join(userRoom);

    console.log(
      `👤 User joined room: ${userRoom}`
    );

    
  // ==========================================
  // REQUEST OFFLINE MESSAGES
  // ==========================================

  socket.on(
    "request_offline_messages",
    async (callback) => {
      try {
        const offlineMessages =
          await getOfflineMessages(userId);

        if (!offlineMessages.length) {
          sendCallback(callback, {
            success: true,
            messages: [],
          });

          return;
        }

        socket.emit(
          "offline_messages",
          offlineMessages,
          async (ack) => {
            try {
              if (
                !ack?.success ||
                !Array.isArray(ack.messageIds)
              ) {
                return;
              }

              // Only acknowledge messages addressed
              // to the authenticated receiving user.
              const delivered = await markMessagesDelivered(
                ack.messageIds,
                userId
              );

              for (const message of delivered) {
                io.to(`user:${message.senderId}`).emit(
                  "message_delivered",
                  message
                );
              }

              console.log(
                `✅ Confirmed ${delivered.length} offline messages for ${userId}`
              );
            } catch (error) {
              console.error(
                "Offline delivery acknowledgement failed:",
                error
              );
            }
          }
        );

        sendCallback(callback, {
          success: true,
          count: offlineMessages.length,
        });

      } catch (error) {
        console.error(
          "Offline message request failed:",
          error
        );

        sendCallback(callback, {
          success: false,
          message: error.message,
        });
      }
    }
  );

    // ======================================
    // SEND MESSAGE
    // ======================================

    socket.on(
      "send_message",
      async (payload, callback) => {

        try {

          // --------------------------------
          // VALIDATE PAYLOAD
          // --------------------------------

          if (
            !payload ||
            typeof payload !== "object"
          ) {

            return sendCallback(callback, {
              success: false,
              message: "Invalid message payload",
            });

          }


          // --------------------------------
          // EXTRACT PAYLOAD
          // --------------------------------

          const {
            receiverId,
            message,
            text,
            clientMessageId,
            conversationId,
          } = payload;


          // --------------------------------
          // NORMALIZE MESSAGE
          // --------------------------------

          const messageText = String(
            message ?? text ?? ""
          ).trim();


          // --------------------------------
          // VALIDATE RECEIVER
          // --------------------------------

          if (!receiverId) {

            return sendCallback(callback, {
              success: false,
              message: "Receiver ID is required",
            });

          }


          // --------------------------------
          // VALIDATE MESSAGE
          // --------------------------------

          if (!messageText) {

            return sendCallback(callback, {
              success: false,
              message: "Message cannot be empty",
            });

          }


          // --------------------------------
          // VALIDATE CLIENT MESSAGE ID
          // --------------------------------

          if (!clientMessageId) {

            return sendCallback(callback, {
              success: false,
              message: "clientMessageId is required",
            });

          }

          const normalizedClientMessageId =
            String(clientMessageId).trim();

          if (!normalizedClientMessageId) {

            return sendCallback(callback, {
              success: false,
              message: "Invalid clientMessageId",
            });

          }


          // --------------------------------
          // PREVENT SELF MESSAGING
          // --------------------------------

          if (
            String(receiverId) === String(userId)
          ) {

            return sendCallback(callback, {
              success: false,
              message: "You cannot message yourself",
            });

          }


          // =================================
          // CHECK CONNECTION
          // =================================

          const connection = await Connection.findOne({

            $or: [
              {
                sender: userId,
                receiver: receiverId,
              },
              {
                sender: receiverId,
                receiver: userId,
              },
            ],

          });


          // --------------------------------
          // NO CONNECTION
          // --------------------------------

          if (!connection) {

            return sendCallback(callback, {
              success: false,
              message: "You are not connected with this user",
            });

          }


          // --------------------------------
          // BLOCKED CONNECTION
          // --------------------------------

          if (connection.status === "blocked") {

            return sendCallback(callback, {
              success: false,
              message: "Messaging is unavailable",
            });

          }


          // --------------------------------
          // ACCEPTED CONNECTION REQUIRED
          // --------------------------------

          if (connection.status !== "accepted") {

            return sendCallback(callback, {
              success: false,
              message: "You can only message an accepted connection",
            });

          }


          // =================================
          // SAVE MESSAGE TO MONGODB
          // =================================

          const savedMessage = await saveMessage({

            senderId: userId,

            receiverId: receiverId,

            message: messageText,

            text: messageText,

            clientMessageId:
              normalizedClientMessageId,

            conversationId:
              conversationId || null,

            status: "sent",

            deliveredAt: null,

            readAt: null,

          });


          // --------------------------------
          // SAFETY CHECK
          // --------------------------------

          if (!savedMessage) {

            return sendCallback(callback, {
              success: false,
              message: "Failed to save message",
            });

          }


          // =================================
          // GET MESSAGE ID
          // =================================

          const savedMessageId =
            savedMessage.messageId ||
            savedMessage.message_id ||
            savedMessage.id ||
            savedMessage._id?.toString();

          console.log(
            `💾 Message saved: ${savedMessageId}`
          );

          console.log(
            `🆔 Client message ID: ${normalizedClientMessageId}`
          );


          // =================================
          // CHECK RECEIVER ONLINE
          // =================================

          const receiverSockets = await io
            .in(`user:${receiverId}`)
            .fetchSockets();

          const receiverOnline =
            receiverSockets.length > 0;


          // ==========================================
          // REAL-TIME DELIVERY
          // MARK DELIVERED ONLY AFTER ACK
          // ==========================================

          if (receiverOnline) {

            console.log(
              `📡 Receiver online: ${receiverId}`
            );

            // Keep initial status as SENT.
            // Do not mark delivered before ACK.

            savedMessage.status = "sent";

            savedMessage.deliveredAt = null;


            // --------------------------------------
            // SEND MESSAGE TO ALL RECEIVER DEVICES
            // --------------------------------------

            io.to(`user:${receiverId}`)
              .timeout(DELIVERY_ACK_TIMEOUT)
              .emit(
                "receive_message",
                savedMessage,
                async (error, acknowledgements) => {

                  try {

                    // --------------------------------
                    // CHECK ACKNOWLEDGEMENT
                    // --------------------------------

                    if (error) {

                      console.log(
                        `⏳ Receiver acknowledgement timeout: ${receiverId}`
                      );

                      return;
                    }

                    const responses = Array.isArray(
                      acknowledgements
                    )
                      ? acknowledgements
                      : [acknowledgements];


                    // --------------------------------
                    // AT LEAST ONE DEVICE MUST CONFIRM
                    // --------------------------------

                    const confirmed = responses.some(
                      (ack) => ack?.success === true
                    );

                    if (!confirmed) {

                      console.log(
                        `⚠️ Message not acknowledged by receiver: ${receiverId}`
                      );

                      return;
                    }


                    // --------------------------------
                    // UPDATE DATABASE DELIVERY STATUS
                    // --------------------------------

                    const deliveredMessage =
                      await markDelivered(savedMessageId);

                    if (!deliveredMessage) {

                      console.error(
                        `❌ Could not update delivery status: ${savedMessageId}`
                      );

                      return;
                    }


                    // --------------------------------
                    // NOTIFY SENDER
                    // --------------------------------

                    io.to(`user:${userId}`).emit(
                      "message_delivered",
                      deliveredMessage
                    );

                    console.log(
                      `✅ Message delivered: ${savedMessageId}`
                    );

                  } catch (error) {

                    console.error(
                      "Live delivery acknowledgement error:",
                      error
                    );

                  }

                }
              );

          } else {

            // --------------------------------------
            // RECEIVER OFFLINE
            // --------------------------------------

            console.log(
              `📴 Receiver offline: ${receiverId}`
            );

            // Message is already stored in MongoDB.
            // It will be delivered after reconnection.

            savedMessage.status = "sent";

          }


          // =================================
          // NOTIFY SENDER
          // =================================

          socket.emit(
            "message_sent",
            savedMessage
          );


          // =================================
          // SEND ACKNOWLEDGEMENT TO SENDER
          // =================================

          sendCallback(callback, {
            success: true,
            message: savedMessage,
          });


        } catch (error) {

          console.error(
            "Send Message Error:",
            error
          );

          sendCallback(callback, {
            success: false,
            message:
              error.message || "Failed to send message",
          });

        }

      }
    );


    // ======================================
    // MARK MESSAGE AS READ
    // ======================================

    socket.on(
      "mark_message_read",
      async (payload, callback) => {

        try {

          const { messageId } = payload || {};

          if (
            typeof messageId !== "string" ||
            !messageId.trim()
          ) {

            return sendCallback(callback, {
              success: false,
              message: "Message ID is required",
            });

          }


          // User ID comes from authenticated JWT.

          const readMessage = await markMessageRead({

            messageId: messageId.trim(),

            userId,

          });


          if (!readMessage) {

            return sendCallback(callback, {
              success: false,
              message: "Message not found or not authorized",
            });

          }


          // --------------------------------
          // NOTIFY SENDER
          // --------------------------------

          io.to(`user:${readMessage.senderId}`).emit(
            "message_read",
            readMessage
          );


          // --------------------------------
          // ACKNOWLEDGEMENT
          // --------------------------------

          sendCallback(callback, {
            success: true,
            message: readMessage,
          });

        } catch (error) {

          console.error(
            "Mark Message Read Error:",
            error
          );

          sendCallback(callback, {
            success: false,
            message: "Failed to mark message as read",
          });

        }

      }
    );


    // ======================================
    // TYPING START
    // ======================================

    socket.on(
      "typing_start",
      (payload) => {

        const { receiverId } = payload || {};

        if (
          !receiverId ||
          String(receiverId) === String(userId)
        ) {
          return;
        }

        io.to(`user:${receiverId}`).emit(
          "typing_start",
          {
            userId,
          }
        );

      }
    );


    // ======================================
    // TYPING STOP
    // ======================================

    socket.on(
      "typing_stop",
      (payload) => {

        const { receiverId } = payload || {};

        if (
          !receiverId ||
          String(receiverId) === String(userId)
        ) {
          return;
        }

        io.to(`user:${receiverId}`).emit(
          "typing_stop",
          {
            userId,
          }
        );

      }
    );


    // ======================================
    // DISCONNECT
    // ======================================

    socket.on(
      "disconnect",
      (reason) => {

        console.log(
          `🔌 Socket disconnected: ${userId}`
        );

        console.log(
          `Disconnect reason: ${reason}`
        );

      }
    );

  });

};
