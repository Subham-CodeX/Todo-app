const jwt =
  require(
    "jsonwebtoken"
  );


const User =
  require(
    "../models/User"
  );


const Connection =
  require(
    "../models/Connection"
  );


const {
  saveMessage,
  getOfflineMessages,
  markMessagesDelivered,
  markDelivered,
} =
  require(
    "../services/messageService"
  );


// ==========================================
// INITIALIZE SOCKET SERVER
// ==========================================

module.exports =
  (
    io
  ) => {


    // ======================================
    // SOCKET AUTHENTICATION
    // ======================================

    io.use(

      async (
        socket,
        next
      ) => {

        try {

          // ----------------------------------
          // GET JWT TOKEN
          // ----------------------------------

          const token =
            socket
              .handshake
              ?.auth
              ?.token;


          if (
            !token
          ) {

            return next(
              new Error(
                "Authentication required"
              )
            );

          }


          // ----------------------------------
          // VERIFY JWT
          // ----------------------------------

          const decoded =
            jwt.verify(

              token,

              process.env.JWT_SECRET

            );


          if (
            !decoded ||
            !decoded.id
          ) {

            return next(
              new Error(
                "Invalid authentication token"
              )
            );

          }


          // ----------------------------------
          // FIND USER
          // ----------------------------------

          const user =
            await User.findById(
              decoded.id
            );


          if (
            !user
          ) {

            return next(
              new Error(
                "User not found"
              )
            );

          }


          // ----------------------------------
          // ATTACH AUTHENTICATED USER
          // ----------------------------------

          socket.user =
            {

              id:
                user._id.toString(),

              name:
                user.name,

            };


          console.log(

            `🔐 Socket authenticated: ${socket.user.id}`

          );


          next();

        }

        catch (
          error
        ) {

          console.error(

            "Socket Authentication Error:",

            error.message

          );


          return next(
            new Error(
              "Invalid authentication token"
            )
          );

        }

      }

    );


    // ======================================
    // SOCKET CONNECTION
    // ======================================

    io.on(

      "connection",

      async (
        socket
      ) => {

        const userId =
          socket.user.id;


        console.log(

          `🔌 Socket connected: ${userId}`

        );


        // ==================================
        // PERSONAL USER ROOM
        // ==================================

        const userRoom =
          `user:${userId}`;


        socket.join(
          userRoom
        );


        console.log(

          `👤 User joined room: ${userRoom}`

        );


        // ==================================
        // DELIVER OFFLINE MESSAGES
        // ==================================

        try {

          const offlineMessages =
            await getOfflineMessages(
              userId
            );


          if (

            Array.isArray(
              offlineMessages
            ) &&

            offlineMessages.length >
            0

          ) {

            console.log(

              `📨 Delivering ${offlineMessages.length} offline messages to ${userId}`

            );


            // --------------------------------
            // SEND OFFLINE MESSAGES
            // --------------------------------

            socket.emit(

              "offline_messages",

              offlineMessages

            );


            // --------------------------------
            // GET MESSAGE IDS
            // --------------------------------

            const messageIds =
              offlineMessages

                .map(

                  (
                    message
                  ) =>

                    message.messageId ||

                    message.message_id ||

                    message.id

                )

                .filter(
                  Boolean
                );


            // --------------------------------
            // MARK DELIVERED
            // --------------------------------

            if (

              messageIds.length >
              0

            ) {

              await markMessagesDelivered(

                messageIds

              );

            }

          }

        }

        catch (
          error
        ) {

          console.error(

            "Offline Message Delivery Error:",

            error

          );


          // Do not disconnect the socket.
          // The client can synchronize later
          // through REST API.

        }


        // ==================================
        // SEND MESSAGE
        // ==================================

        socket.on(

          "send_message",

          async (
            payload,
            callback
          ) => {

            try {

              // =================================
              // VALIDATE PAYLOAD
              // =================================

              if (
                !payload ||
                typeof payload !==
                "object"
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "Invalid message payload",

                });

              }


              // =================================
              // EXTRACT PAYLOAD
              // =================================

              const {
                receiverId,
                message,
                text,
                clientMessageId,
                conversationId,
              } =
                payload;


              // =================================
              // NORMALIZE MESSAGE TEXT
              // =================================

              const messageText =
                String(

                  message ??
                  text ??
                  ""

                )
                  .trim();


              // =================================
              // VALIDATE RECEIVER
              // =================================

              if (
                !receiverId
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "Receiver ID is required",

                });

              }


              // =================================
              // VALIDATE MESSAGE
              // =================================

              if (
                !messageText
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "Message cannot be empty",

                });

              }


              // =================================
              // VALIDATE CLIENT MESSAGE ID
              // =================================

              if (
                !clientMessageId
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "clientMessageId is required",

                });

              }


              const normalizedClientMessageId =
                String(
                  clientMessageId
                ).trim();


              if (
                !normalizedClientMessageId
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "Invalid clientMessageId",

                });

              }


              // =================================
              // PREVENT SELF MESSAGE
              // =================================

              if (
                String(
                  receiverId
                ) ===
                String(
                  userId
                )
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "You cannot message yourself",

                });

              }


              // =================================
              // CHECK CONNECTION
              // =================================
              //
              // IMPORTANT:
              //
              // We intentionally do NOT filter
              // status = "accepted" here.
              //
              // Otherwise a blocked connection
              // cannot be detected separately.
              //
              // =================================

              const connection =
                await Connection.findOne(

                  {

                    $or:
                      [

                        {

                          sender:
                            userId,

                          receiver:
                            receiverId,

                        },

                        {

                          sender:
                            receiverId,

                          receiver:
                            userId,

                        },

                      ],

                  }

                );


              // =================================
              // NO CONNECTION
              // =================================

              if (
                !connection
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "You are not connected with this user",

                });

              }


              // =================================
              // BLOCKED CONNECTION
              // =================================

              if (
                connection.status ===
                "blocked"
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "Messaging is unavailable",

                });

              }


              // =================================
              // CONNECTION MUST BE ACCEPTED
              // =================================

              if (
                connection.status !==
                "accepted"
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "You can only message an accepted connection",

                });

              }


              // =================================
              // SAVE MESSAGE
              // =================================
              //
              // clientMessageId is extremely
              // important for offline-first
              // synchronization.
              //
              // The message service must later
              // persist this value in MongoDB
              // with a UNIQUE index.
              //
              // =================================

              const savedMessage =
                await saveMessage(

                  {

                    senderId:
                      userId,

                    receiverId:
                      receiverId,

                    message:
                      messageText,

                    text:
                      messageText,

                    clientMessageId:
                      normalizedClientMessageId,

                    conversationId:
                      conversationId ||
                      null,

                  }

                );


              // =================================
              // SAFETY CHECK
              // =================================

              if (
                !savedMessage
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "Failed to save message",

                });

              }


              // =================================
              // GET MESSAGE ID
              // =================================

              const savedMessageId =

                savedMessage.messageId ||

                savedMessage.message_id ||

                savedMessage.id;


              console.log(

                `💾 Message saved: ${savedMessageId}`

              );


              console.log(

                `🆔 Client message ID: ${normalizedClientMessageId}`

              );


              // =================================
              // CHECK RECEIVER ONLINE
              // =================================

              const receiverSockets =
                await io

                  .in(
                    `user:${receiverId}`
                  )

                  .fetchSockets();


              const receiverOnline =
                receiverSockets.length >
                0;


              // =================================
              // UPDATE DELIVERY STATUS
              // =================================

              if (
                receiverOnline
              ) {

                if (
                  savedMessageId
                ) {

                  await markDelivered(

                    savedMessageId

                  );

                }


                savedMessage.status =
                  "delivered";


                savedMessage.deliveredAt =
                  new Date();


              }

              else {

                savedMessage.status =
                  "sent";

              }


              // =================================
              // SEND TO RECEIVER
              // =================================

              io.to(

                `user:${receiverId}`

              ).emit(

                "receive_message",

                savedMessage

              );


              // =================================
              // SEND TO SENDER
              // =================================
              //
              // This allows the sender's local
              // pending message to be reconciled
              // with the server version.
              //
              // =================================

              socket.emit(

                "message_sent",

                savedMessage

              );


              // =================================
              // ACKNOWLEDGEMENT
              // =================================

              callback?.({

                success:
                  true,

                message:
                  savedMessage,

              });


            }

            catch (
              error
            ) {

              console.error(

                "Send Message Error:",

                error

              );


              // =================================
              // SEND FAILURE TO CLIENT
              // =================================

              callback?.({

                success:
                  false,

                message:
                  error.message ||
                  "Failed to send message",

              });

            }

          }

        );


        // ======================================
        // MARK MESSAGE AS READ
        // ======================================

        socket.on(

          "mark_message_read",

          async (
            payload,
            callback
          ) => {

            try {

              const {
                messageId,
              } =
                payload ||
                {};


              if (
                !messageId
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "Message ID is required",

                });

              }


              /*
               *
               * The permanent MongoDB
               * implementation will update
               * the message here.
               *
               * For the current transitional
               * service, this event is kept
               * ready for the MongoDB service.
               *
               */


              callback?.({

                success:
                  true,

                messageId:

                  messageId,

              });

            }

            catch (
              error
            ) {

              console.error(

                "Mark Message Read Error:",

                error

              );


              callback?.({

                success:
                  false,

                message:
                  "Failed to mark message as read",

              });

            }

          }

        );


        // ======================================
        // TYPING START
        // ======================================

        socket.on(

          "typing_start",

          (
            payload
          ) => {

            const {
              receiverId,
            } =
              payload ||
              {};


            if (
              !receiverId
            ) {

              return;

            }


            if (
              String(
                receiverId
              ) ===
              String(
                userId
              )
            ) {

              return;

            }


            io.to(

              `user:${receiverId}`

            ).emit(

              "typing_start",

              {

                userId:
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

          (
            payload
          ) => {

            const {
              receiverId,
            } =
              payload ||
              {};


            if (
              !receiverId
            ) {

              return;

            }


            if (
              String(
                receiverId
              ) ===
              String(
                userId
              )
            ) {

              return;

            }


            io.to(

              `user:${receiverId}`

            ).emit(

              "typing_stop",

              {

                userId:
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

          (
            reason
          ) => {

            console.log(

              `🔌 Socket disconnected: ${userId}`

            );


            console.log(

              `Disconnect reason: ${reason}`

            );

          }

        );

      }

    );

  };