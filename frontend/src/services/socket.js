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
    // SOCKET ALREADY CREATED
    // ======================================

    if (
      socket &&
      !socket.connected
    ) {

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

          transports: [
            "websocket",
            "polling",
          ],

          auth: {
            token,
          },

          reconnection:
            true,

          reconnectionAttempts:
            10,

          reconnectionDelay:
            1000,

          reconnectionDelayMax:
            5000,

        }
      );


    // ======================================
    // EVENTS
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


    socket.on(
      "connect_error",
      (
        error
      ) => {

        console.error(
          "Socket connection error:",
          error.message
        );

      }
    );


    // ======================================
    // CONNECT
    // ======================================

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