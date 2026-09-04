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

          const token =
            socket.handshake.auth
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


          const decoded =
            jwt.verify(
              token,
              process.env.JWT_SECRET
            );


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


          socket.user =
            {
              id:
                user._id.toString(),

              name:
                user.name,
            };


          next();

        } catch (
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
    // CONNECTION
    // ======================================

    io.on(
      "connection",
      (
        socket
      ) => {

        console.log(
          `Socket connected: ${socket.user.id}`
        );


        // ==================================
        // PERSONAL ROOM
        // ==================================

        socket.join(
          `user:${socket.user.id}`
        );


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

              const {
                receiverId,
                text,
              } =
                payload ||
                {};


              // ==============================
              // VALIDATION
              // ==============================

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


              if (
                !text ||
                !text.trim()
              ) {

                return callback?.({
                  success:
                    false,

                  message:
                    "Message cannot be empty",
                });

              }


              if (
                receiverId ===
                socket.user.id
              ) {

                return callback?.({
                  success:
                    false,

                  message:
                    "You cannot message yourself",
                });

              }


              // ==============================
              // CHECK CONNECTION
              // ==============================

              const connection =
                await Connection.findOne(
                  {
                    status:
                      "accepted",

                    $or:
                      [

                        {
                          sender:
                            socket.user.id,

                          receiver:
                            receiverId,
                        },

                        {
                          sender:
                            receiverId,

                          receiver:
                            socket.user.id,
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


              // ==============================
              // BLOCK CHECK
              // ==============================

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


              // ==============================
              // MESSAGE OBJECT
              // ==============================

              const message =
                {
                  id:
                    `${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2)}`,

                  senderId:
                    socket.user.id,

                  receiverId,

                  text:
                    text.trim(),

                  createdAt:
                    new Date()
                      .toISOString(),
                };


              // ==============================
              // SEND TO RECEIVER
              // ==============================

              io.to(
                `user:${receiverId}`
              ).emit(
                "receive_message",
                message
              );


              // ==============================
              // SEND BACK TO SENDER
              // ==============================

              socket.emit(
                "message_sent",
                message
              );


              // ==============================
              // ACKNOWLEDGEMENT
              // ==============================

              callback?.({
                success:
                  true,

                message,
              });


            } catch (
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
          () => {

            console.log(
              `Socket disconnected: ${socket.user.id}`
            );

          }
        );

      }
    );

  };