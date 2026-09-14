import { io } from "socket.io-client";

// ============================================
// SINGLE SOCKET INSTANCE
// ============================================

let socket = null;

// ============================================
// SOCKET STATE LISTENERS
// ============================================

const listeners = new Set();

// ============================================
// NOTIFY STATE LISTENERS
// ============================================

const notifyListeners = (
  event
) => {
  listeners.forEach(
    (listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(
          "Socket listener error:",
          error
        );
      }
    }
  );
};

// ============================================
// CREATE SOCKET
// ============================================

const createSocket = (
  token
) => {
  const instance =
    io(
      import.meta.env
        .VITE_API_URL,
      {
        autoConnect: false,

        transports: [
          "websocket",
          "polling",
        ],

        auth: {
          token,
        },

        reconnection: true,

        reconnectionAttempts:
          Infinity,

        reconnectionDelay:
          1000,

        reconnectionDelayMax:
          5000,

        timeout:
          10000,
      }
    );

  // ==========================================
  // CONNECT
  // ==========================================

  instance.on(
    "connect",
    () => {
      console.log(
        "✅ Socket.IO connected:",
        instance.id
      );

      notifyListeners({
        type: "connect",
      });
    }
  );

  // ==========================================
  // DISCONNECT
  // ==========================================

  instance.on(
    "disconnect",
    (
      reason
    ) => {
      console.log(
        "🔴 Socket.IO disconnected:",
        reason
      );

      notifyListeners({
        type: "disconnect",

        reason,
      });
    }
  );

  // ==========================================
  // CONNECTION ERROR
  // ==========================================

  instance.on(
    "connect_error",
    (
      error
    ) => {
      console.error(
        "❌ Socket.IO connection error:",
        error.message
      );

      notifyListeners({
        type:
          "connect_error",

        error,
      });
    }
  );

  // ==========================================
  // RECONNECT ATTEMPT
  // ==========================================

  instance.io.on(
    "reconnect_attempt",
    (
      attempt
    ) => {
      console.log(
        "🔄 Socket reconnect attempt:",
        attempt
      );
    }
  );

  // ==========================================
  // RECONNECT
  // ==========================================

  instance.io.on(
    "reconnect",
    (
      attempt
    ) => {
      console.log(
        "🟢 Socket reconnected after attempt:",
        attempt
      );

      notifyListeners({
        type:
          "reconnect",

        attempt,
      });
    }
  );

  return instance;
};

// ============================================
// CONNECT SOCKET
// ============================================

export const connectSocket =
  (
    token
  ) => {
    if (!token) {
      console.warn(
        "Cannot connect socket without token"
      );

      return null;
    }

    // ========================================
    // EXISTING SOCKET
    // ========================================

    if (socket) {
      socket.auth = {
        token,
      };

      if (
        !socket.connected
      ) {
        socket.connect();
      }

      return socket;
    }

    // ========================================
    // CREATE NEW SOCKET
    // ========================================

    socket =
      createSocket(
        token
      );

    socket.connect();

    return socket;
  };

// ============================================
// GET SOCKET
// ============================================

export const getSocket =
  () => {
    return socket;
  };

// ============================================
// SOCKET CONNECTED?
// ============================================

export const isSocketConnected =
  () => {
    return Boolean(
      socket &&
      socket.connected
    );
  };

// ============================================
// SUBSCRIBE SOCKET STATE
// ============================================

export const subscribeSocket =
  (
    listener
  ) => {
    listeners.add(
      listener
    );

    return () => {
      listeners.delete(
        listener
      );
    };
  };

// ============================================
// FORCE RECONNECT
// ============================================

export const reconnectSocket =
  () => {
    if (
      socket &&
      !socket.connected
    ) {
      socket.connect();
    }
  };

// ============================================
// DISCONNECT
// ============================================

export const disconnectSocket =
  () => {
    if (socket) {
      socket.removeAllListeners();

      socket.disconnect();

      socket = null;
    }

    listeners.clear();
  };