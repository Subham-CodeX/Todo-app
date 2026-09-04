import {
  io,
} from "socket.io-client";


let socket =
  null;


export const connectSocket =
  (
    token
  ) => {


    // ======================================
    // ALREADY CONNECTED
    // ======================================

    if (
      socket &&
      socket.connected
    ) {

      return socket;

    }


    // ======================================
    // SOCKET ALREADY EXISTS
    // ======================================

    if (
      socket
    ) {

      socket.auth =
        {
          token,
        };


      socket.connect();


      return socket;

    }


    // ======================================
    // CREATE SOCKET
    // ======================================

    socket =
      io(
        import.meta.env.VITE_API_URL,
        {

          autoConnect:
            false,

          transports:
            [
              "websocket",
              "polling",
            ],

          auth:
            {
              token,
            },

          reconnection:
            true,

          reconnectionAttempts:
            Infinity,

          reconnectionDelay:
            1000,

          reconnectionDelayMax:
            5000,

        }
      );


    // ======================================
    // CONNECTED
    // ======================================

    socket.on(
      "connect",
      () => {

        console.log(
          "🟢 Socket connected:",
          socket.id
        );

      }
    );


    // ======================================
    // DISCONNECTED
    // ======================================

    socket.on(
      "disconnect",
      (
        reason
      ) => {

        console.log(
          "🔴 Socket disconnected:",
          reason
        );

      }
    );


    // ======================================
    // CONNECTION ERROR
    // ======================================

    socket.on(
      "connect_error",
      (
        error
      ) => {

        console.error(
          "🔴 Socket connection error:",
          error.message
        );

      }
    );


    socket.connect();


    return socket;

};


// ==========================================
// GET SOCKET
// ==========================================

export const getSocket =
  () =>
    socket;


// ==========================================
// DISCONNECT SOCKET
// ==========================================

export const disconnectSocket =
  () => {

    if (
      socket
    ) {

      socket.disconnect();

      socket =
        null;

    }

  };