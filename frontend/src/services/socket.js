import {
  io,
} from "socket.io-client";


let socket =
  null;


// ==========================================
// CONNECT SOCKET
// ==========================================

export const connectSocket =
  (
    token
  ) => {

    if (
      socket?.connected
    ) {

      return socket;

    }


    socket =
      io(
        import.meta.env
          .VITE_API_URL,
        {
          transports:
            [
              "websocket",
              "polling",
            ],

          auth:
            {
              token,
            },
        }
      );


    socket.on(
      "connect",
      () => {

        console.log(
          "Socket connected:",
          socket.id
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


    socket.on(
      "disconnect",
      (
        reason
      ) => {

        console.log(
          "Socket disconnected:",
          reason
        );

      }
    );


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