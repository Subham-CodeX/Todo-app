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
          // GET TOKEN
          // ----------------------------------

          const token =
            socket.handshake
              .auth
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
          // ATTACH USER TO SOCKET
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


          next(

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

            offlineMessages &&

            offlineMessages.length >
            0

          ) {

            console.log(

              `📨 Delivering ${offlineMessages.length} offline messages to ${userId}`

            );


            // ------------------------------
            // SEND OFFLINE MESSAGES
            // ------------------------------

            socket.emit(

              "offline_messages",

              offlineMessages

            );


            // ------------------------------
            // GET MESSAGE IDS
            // ------------------------------

            const messageIds =
              offlineMessages

                .map(

                  (
                    message
                  ) =>

                    message.message_id ||

                    message.id

                )

                .filter(
                  Boolean
                );


            // ------------------------------
            // MARK AS DELIVERED
            // ------------------------------

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
              // EXTRACT PAYLOAD
              // =================================

              const {
                receiverId,
                message,
                text,
              } =
                payload ||
                {};


              /*
               * Support both:
               *
               * message
               *
               * and older:
               *
               * text
               *
               * payload formats.
               */

              const messageText =
                (

                  message ??

                  text ??

                  ""

                ).trim();


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
              // PREVENT SELF MESSAGE
              // =================================

              if (
                receiverId ===
                userId
              ) {

                return callback?.({

                  success:
                    false,

                  message:
                    "You cannot message yourself",

                });

              }


              // =================================
              // CHECK ACCEPTED CONNECTION
              // =================================

              const connection =
                await Connection.findOne(

                  {

                    status:
                      "accepted",

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
              // BLOCK CHECK
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
              // SAVE MESSAGE
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

                  }

                );


              console.log(

                `💾 Message saved: ${
                  savedMessage.message_id ||
                  savedMessage.id
                }`

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
              // MARK DELIVERED
              // =================================

              if (
                receiverOnline
              ) {

                const savedMessageId =

                  savedMessage.message_id ||

                  savedMessage.id;


                if (
                  savedMessageId
                ) {

                  await markDelivered(

                    savedMessageId

                  );

                }


                savedMessage.status =
                  "delivered";

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
              // SEND BACK TO SENDER
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


              callback?.({

                success:
                  false,

                message:
                  "Failed to send message",

              });

            }

          }

        );


        // ==================================
        // DISCONNECT
        // ==================================

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