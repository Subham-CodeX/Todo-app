import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaPaperPlane,
} from "react-icons/fa";

import {
  getSocket,
  isSocketConnected,
  subscribeSocket,
} from "../../services/socket";

import {
  createLocalMessage,
  syncChat,
  syncAllPending,
} from "../../services/chatSync";

import {
  sendMessageApi,
} from "../../services/messageApi";

import ChatStorage from
  "../../services/chatStorage/chatStorage";


// ============================================
// NORMALIZE MESSAGE
// ============================================

const normalizeMessage = (
  message
) => {

  const senderId =
    message?.senderId ??
    message?.sender_id ??
    "";

  const receiverId =
    message?.receiverId ??
    message?.receiver_id ??
    "";

  return {

    id:
      message?.id ??
      message?.messageId ??
      message?.message_id ??
      message?.clientMessageId ??
      message?.client_message_id,

    messageId:
      message?.messageId ??
      message?.message_id ??
      null,

    clientMessageId:
      message?.clientMessageId ??
      message?.client_message_id ??
      null,

    senderId:
      String(senderId),

    receiverId:
      String(receiverId),

    text:
      message?.text ??
      message?.message ??
      "",

    status:
      message?.status ||
      "sent",

    createdAt:
      message?.createdAt ??
      message?.created_at ??
      new Date().toISOString(),

    deliveredAt:
      message?.deliveredAt ??
      message?.delivered_at ??
      null,

    readAt:
      message?.readAt ??
      message?.read_at ??
      null,
  };
};


// ============================================
// MESSAGE KEY
// ============================================

const getMessageKey = (message) => {
  const clientId =
    message?.clientMessageId ??
    message?.client_message_id;

  const serverId =
    message?.messageId ??
    message?.message_id ??
    message?.id;

  return clientId
    ? `client:${clientId}`
    : serverId
      ? `server:${serverId}`
      : null;
};


// ============================================
// MERGE MESSAGES
// ============================================

const mergeMessages = (current, incoming) => {
  const map = new Map();

  [...current, ...incoming].forEach((rawMessage) => {
    const message = normalizeMessage(rawMessage);
    const key = getMessageKey(message);

    if (!key) return;

    const existing = map.get(key);

    if (existing) {
      // Keep the local message's original timestamp
      // when the server confirms the same message.
      map.set(key, {
        ...existing,
        ...message,
        createdAt:
          existing.createdAt || message.createdAt,
      });
    } else {
      map.set(key, message);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
  );
};


// ============================================
// COMPONENT
// ============================================

export default function ChatWindow({
  user,
  selectedUser,
  onBack,
}) {

  // ==========================================
  // STATE
  // ==========================================

  const [
    messages,
    setMessages,
  ] =
    useState([]);

  const [
    input,
    setInput,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    syncing,
    setSyncing,
  ] =
    useState(false);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    socketConnected,
    setSocketConnected,
  ] =
    useState(
      isSocketConnected()
    );


  // ==========================================
  // REFS
  // ==========================================

  const messagesEndRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  // Prevent repeated read-receipt requests while React re-renders.
  const readRequestedRef =
    useRef(new Set());


  // ==========================================
  // USER IDS
  // ==========================================

  const currentUserId =
    user?._id ||
    user?.id;

  const selectedUserId =
    selectedUser?._id ||
    selectedUser?.id;


  const currentUserIdString =
    String(
      currentUserId || ""
    );

  const selectedUserIdString =
    String(
      selectedUserId || ""
    );


  // ==========================================
  // SELECTED USER DISPLAY
  // ==========================================

  const selectedName =
    selectedUser?.name ||
    selectedUser?.email ||
    "Chat";


  const selectedInitial =
    selectedName
      .charAt(0)
      .toUpperCase();


  // ==========================================
  // SCROLL TO BOTTOM
  // ==========================================

  const scrollToBottom =
    useCallback(
      (
        behavior = "smooth"
      ) => {

        requestAnimationFrame(
          () => {

            messagesEndRef
              .current
              ?.scrollIntoView({
                behavior,
                block: "end",
              });

          }
        );

      },
      []
    );


  // ==========================================
  // SOCKET CONNECTION STATE
  // ==========================================

  useEffect(
    () => {

      setSocketConnected(
        isSocketConnected()
      );

      const unsubscribe =
        subscribeSocket(
          (
            event
          ) => {

            if (
              event.type ===
                "connect" ||
              event.type ===
                "reconnect"
            ) {

              setSocketConnected(
                true
              );

            }

            if (
              event.type ===
                "disconnect" ||
              event.type ===
                "connect_error"
            ) {

              setSocketConnected(
                false
              );

            }

          }
        );

      return unsubscribe;

    },
    []
  );


  // ==========================================
  // LOAD LOCAL CHAT
  // ==========================================

  useEffect(
    () => {

      let cancelled =
        false;


      const loadLocal =
        async () => {

          if (
            !currentUserId ||
            !selectedUserId
          ) {

            setMessages([]);

            setLoading(false);

            return;
          }


          setLoading(true);


          try {

            await ChatStorage.initialize();


            const localMessages =
              await ChatStorage.getMessages(
                currentUserIdString,
                selectedUserIdString
              );


            if (
              cancelled
            ) {

              return;

            }


            setMessages(
              localMessages.map(
                normalizeMessage
              )
            );

          } catch (
            error
          ) {

            console.error(
              "❌ Local chat load failed:",
              error
            );

          } finally {

            if (
              !cancelled
            ) {

              setLoading(false);

            }

          }

        };


      loadLocal();


      return () => {

        cancelled =
          true;

      };

    },
    [
      currentUserIdString,
      selectedUserIdString,
      currentUserId,
      selectedUserId,
    ]
  );


  // ==========================================
  // SERVER SYNC
  // ==========================================

  useEffect(
    () => {

      let cancelled =
        false;


      const synchronize =
        async () => {

          if (
            !currentUserId ||
            !selectedUserId
          ) {

            return;

          }


          if (
            !navigator.onLine
          ) {

            return;

          }


          setSyncing(true);


          try {

            const result =
              await syncChat({
                ownerId:
                  currentUserId,

                otherUserId:
                  selectedUserId,
              });


            if (
              cancelled
            ) {

              return;

            }


            if (
              result?.messages?.length
            ) {

              setMessages(
                (
                  previous
                ) =>
                  mergeMessages(
                    previous,
                    result.messages
                  )
              );

            }

          } catch (
            error
          ) {

            console.error(
              "❌ Chat synchronization failed:",
              error
            );

          } finally {

            if (
              !cancelled
            ) {

              setSyncing(false);

            }

          }

        };


      synchronize();


      return () => {

        cancelled =
          true;

      };

    },
    [
      currentUserId,
      selectedUserId,
    ]
  );


  // ==========================================
  // RECEIVE MESSAGE
  // ==========================================

  useEffect(
    () => {

      const socket =
        getSocket();


      if (
        !socket ||
        !currentUserId ||
        !selectedUserId
      ) {

        return;

      }


      const handleReceive =
        async (
          incoming , acknowledge
        ) => {

          const normalized =
            normalizeMessage(
              incoming
            );


          const isCurrentConversation =
            (
              normalized.senderId ===
                selectedUserIdString &&
              normalized.receiverId ===
                currentUserIdString
            ) ||
            (
              normalized.senderId ===
                currentUserIdString &&
              normalized.receiverId ===
                selectedUserIdString
            );


          if (
            !isCurrentConversation
          ) {

            return;

          }


          try {

            await ChatStorage.saveMessage(
              currentUserIdString,
              normalized
            );

          } catch (
            error
          ) {

            console.error(
              "❌ Failed to save received message:",
              error
            );

          }


          setMessages(
            (
              previous
            ) =>
              mergeMessages(
                previous,
                [normalized]
              )
          );

          acknowledge?.({
            success: true,
            messageId: normalized.messageId,
          });


          scrollToBottom();

        };


      socket.on(
        "receive_message",
        handleReceive
      );


      return () => {

        socket.off(
          "receive_message",
          handleReceive
        );

      };

    },
    [
      currentUserId,
      selectedUserId,
      currentUserIdString,
      selectedUserIdString,
      scrollToBottom,
    ]
  );


  // ==========================================
  // MESSAGE SENT EVENT
  // ==========================================

  useEffect(
    () => {

      const socket =
        getSocket();


      if (
        !socket ||
        !currentUserId ||
        !selectedUserId
      ) {

        return;

      }


      const handleSent =
        async (
          serverMessage
        ) => {

          const normalized =
            normalizeMessage(
              serverMessage
            );


          const isCurrentConversation =
            (
              normalized.senderId ===
                currentUserIdString &&
              normalized.receiverId ===
                selectedUserIdString
            ) ||
            (
              normalized.senderId ===
                selectedUserIdString &&
              normalized.receiverId ===
                currentUserIdString
            );


          if (
            !isCurrentConversation
          ) {

            return;

          }


          try {

            await ChatStorage.saveMessage(
              currentUserIdString,
              normalized
            );

          } catch (
            error
          ) {

            console.error(
              "❌ Failed to save sent message:",
              error
            );

          }


          setMessages(
            (
              previous
            ) =>
              mergeMessages(
                previous,
                [normalized]
              )
          );


          setSending(false);

          scrollToBottom();

        };


      socket.on(
        "message_sent",
        handleSent
      );


      return () => {

        socket.off(
          "message_sent",
          handleSent
        );

      };

    },
    [
      currentUserId,
      selectedUserId,
      currentUserIdString,
      selectedUserIdString,
      scrollToBottom,
    ]
  );

  // ==========================================
// MESSAGE DELIVERED EVENT
// ==========================================

useEffect(() => {
  const socket = getSocket();

  if (!socket || !currentUserIdString) return;

  const handleDelivered = async (rawMessage) => {
    const normalized = normalizeMessage(rawMessage);

    if (
      normalized.senderId !== currentUserIdString ||
      normalized.status !== "delivered"
    ) {
      return;
    }

    try {
      await ChatStorage.saveMessage(
        currentUserIdString,
        normalized
      );

      setMessages((previous) =>
        mergeMessages(previous, [normalized])
      );
    } catch (error) {
      console.error("Delivery status update failed:", error);
    }
  };

  socket.on("message_delivered", handleDelivered);

  return () => {
    socket.off("message_delivered", handleDelivered);
  };
}, [currentUserIdString]);


  // ==========================================
  // MESSAGE READ RECEIPT EVENT
  // ==========================================

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !currentUserIdString || !selectedUserIdString) {
      return;
    }

    const handleMessageRead = async (rawMessage) => {
      const normalized = normalizeMessage(rawMessage);

      // A receipt only affects our outgoing message in this conversation.
      if (
        normalized.senderId !== currentUserIdString ||
        normalized.receiverId !== selectedUserIdString ||
        normalized.status !== "read"
      ) {
        return;
      }

      try {
        await ChatStorage.saveMessage(
          currentUserIdString,
          normalized
        );
      } catch (error) {
        console.error("Failed to save read receipt:", error);
      }

      setMessages((previous) =>
        mergeMessages(previous, [normalized])
      );
    };

    socket.on("message_read", handleMessageRead);

    return () => {
      socket.off("message_read", handleMessageRead);
    };
  }, [
    currentUserIdString,
    selectedUserIdString,
  ]);


  // ==========================================
  // MARK VISIBLE INCOMING MESSAGES AS READ
  // ==========================================

  useEffect(() => {
    const socket = getSocket();

    if (
      !socket ||
      !socket.connected ||
      !currentUserIdString ||
      !selectedUserIdString
    ) {
      return;
    }

    const unreadMessages = messages.filter((message) => {
      const normalized = normalizeMessage(message);
      const isIncoming =
        normalized.senderId === selectedUserIdString &&
        normalized.receiverId === currentUserIdString;
      const messageId = normalized.messageId;

      return (
        isIncoming &&
        Boolean(messageId) &&
        normalized.status !== "read" &&
        !readRequestedRef.current.has(String(messageId))
      );
    });

    unreadMessages.forEach((rawMessage) => {
      const message = normalizeMessage(rawMessage);
      const messageId = String(message.messageId);

      // Record before emitting so rapid renders cannot send duplicates.
      readRequestedRef.current.add(messageId);

      socket.emit(
        "mark_message_read",
        { messageId },
        async (response) => {
          if (!response?.success || !response.message) {
            readRequestedRef.current.delete(messageId);
            return;
          }

          const readMessage = normalizeMessage(response.message);

          try {
            await ChatStorage.saveMessage(
              currentUserIdString,
              readMessage
            );
          } catch (error) {
            console.error(
              "Failed to save incoming read status:",
              error
            );
          }

          setMessages((previous) =>
            mergeMessages(previous, [readMessage])
          );
        }
      );
    });
  }, [
    messages,
    socketConnected,
    currentUserIdString,
    selectedUserIdString,
  ]);


  // ==========================================
  // OFFLINE SERVER MESSAGES
  // ==========================================

  useEffect(
    () => {

      const socket =
        getSocket();


      if (
        !socket ||
        !currentUserId ||
        !selectedUserId
      ) {

        return;

      }


      const handleOffline = async (offlineMessages, acknowledge) => {
        try {
          if (!Array.isArray(offlineMessages)) {
            acknowledge?.({
              success: false,
              messageIds: [],
            });
            return;
          }

          const relevant = offlineMessages.filter((message) => {
            const normalized = normalizeMessage(message);

            return (
              normalized.senderId === selectedUserIdString &&
              normalized.receiverId === currentUserIdString
            );
          });

          // Persist every message before acknowledging.
          await ChatStorage.saveMessages(
            currentUserIdString,
            relevant
          );

          setMessages((previous) =>
            mergeMessages(previous, relevant)
          );

          acknowledge?.({
            success: true,
            messageIds: relevant
              .map((message) => normalizeMessage(message).messageId)
              .filter(Boolean),
          });

          scrollToBottom();
        } catch (error) {
          console.error("Offline message persistence failed:", error);

          acknowledge?.({
            success: false,
            messageIds: [],
          });
        }
      };


      socket.on(
        "offline_messages",
        handleOffline
      );


      return () => {

        socket.off(
          "offline_messages",
          handleOffline
        );

      };

    },
    [
      currentUserId,
      selectedUserId,
      currentUserIdString,
      selectedUserIdString,
      scrollToBottom,
    ]
  );


  // ==========================================
  // INTERNET RESTORED
  // ==========================================

  useEffect(
    () => {

      if (
        !currentUserId
      ) {

        return;

      }


      const handleOnline =
        async () => {

          console.log(
            "🟢 Internet restored — syncing chat"
          );


          try {

            await syncAllPending(
              currentUserId
            );


            if (
              selectedUserId
            ) {

              const result =
                await syncChat({
                  ownerId:
                    currentUserId,

                  otherUserId:
                    selectedUserId,
                });


              if (
                result?.messages?.length
              ) {

                setMessages(
                  (
                    previous
                  ) =>
                    mergeMessages(
                      previous,
                      result.messages
                    )
                );

              }

            }

          } catch (
            error
          ) {

            console.error(
              "❌ Reconnect sync failed:",
              error
            );

          }

        };


      window.addEventListener(
        "online",
        handleOnline
      );


      return () => {

        window.removeEventListener(
          "online",
          handleOnline
        );

      };

    },
    [
      currentUserId,
      selectedUserId,
    ]
  );


  // ==========================================
  // SOCKET RECONNECT
  // ==========================================

  useEffect(
    () => {

      if (
        !currentUserId
      ) {

        return;

      }


      const unsubscribe =
        subscribeSocket(
          async (
            event
          ) => {

            if (
              event.type !==
                "connect" &&
              event.type !==
                "reconnect"
            ) {

              return;

            }


            try {

              console.log(
                "🔄 Socket connected — syncing pending messages"
              );


              await syncAllPending(
                currentUserId
              );


              if (
                selectedUserId
              ) {

                const result =
                  await syncChat({
                    ownerId:
                      currentUserId,

                    otherUserId:
                      selectedUserId,
                  });


                if (
                  result?.messages?.length
                ) {

                  setMessages(
                    (
                      previous
                    ) =>
                      mergeMessages(
                        previous,
                        result.messages
                      )
                  );

                }

              }

            } catch (
              error
            ) {

              console.error(
                "❌ Socket reconnect sync failed:",
                error
              );

            }

          }
        );


      return unsubscribe;

    },
    [
      currentUserId,
      selectedUserId,
    ]
  );


  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(
    () => {

      scrollToBottom(
        "auto"
      );

    },
    [
      messages,
      scrollToBottom,
    ]
  );


  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage =
    async () => {

      const text =
        input.trim();


      if (
        !text ||
        !currentUserId ||
        !selectedUserId
      ) {

        console.warn(
          "⚠️ Cannot send message:",
          {
            text,
            currentUserId,
            selectedUserId,
          }
        );

        return;

      }


      // ======================================
      // SAVE LOCALLY FIRST
      // ======================================

      let localMessage;


      try {

        localMessage =
          await createLocalMessage({
            ownerId:
              currentUserIdString,

            receiverId:
              selectedUserIdString,

            text,
          });


      } catch (
        error
      ) {

        console.error(
          "❌ Could not save local message:",
          error
        );

        return;

      }


      // ======================================
      // SHOW IMMEDIATELY
      // ======================================

      setMessages(
        (
          previous
        ) =>
          mergeMessages(
            previous,
            [localMessage]
          )
      );


      setInput("");

      setSending(true);


      // ======================================
      // TRY SOCKET
      // ======================================

      const socket =
        getSocket();


      if (
        socket &&
        socket.connected
      ) {

        console.log(
          "📡 Sending message through Socket.IO"
        );


        socket.emit(
          "send_message",
          {
            receiverId:
              selectedUserIdString,

            text,

            clientMessageId:
              localMessage.clientMessageId,
          },
          async (
            response
          ) => {

            console.log(
              "📨 Socket send response:",
              response
            );


            if (response?.success && response.message) {
              const serverMessage = normalizeMessage(response.message);

              try {
                await ChatStorage.saveMessage(
                  currentUserIdString,
                  serverMessage
                );
              } catch (error) {
                console.error(
                  "Failed to save socket-confirmed message:",
                  error
                );
              }

              setMessages((previous) =>
                mergeMessages(previous, [serverMessage])
              );

              setSending(false);
              return;
            }


            // ==================================
            // SOCKET FAILED → REST FALLBACK
            // ==================================

            try {

              const serverMessage =
                await sendMessageApi(
                  selectedUserIdString,
                  {
                    text,

                    clientMessageId:
                      localMessage.clientMessageId,
                  }
                );


              if (
                serverMessage
              ) {

                await ChatStorage.updateMessage(
                  currentUserIdString,
                  serverMessage
                );


                setMessages(
                  (
                    previous
                  ) =>
                    mergeMessages(
                      previous,
                      [serverMessage]
                    )
                );


                setSending(false);

              }

            } catch (
              error
            ) {

              console.error(
                "❌ REST fallback failed:",
                error
              );


              // Keep message locally queued.
              setSending(false);

            }

          }
        );


        return;

      }


      // ======================================
      // SOCKET NOT CONNECTED
      // ======================================

      if (
        navigator.onLine
      ) {

        try {

          const serverMessage =
            await sendMessageApi(
              selectedUserIdString,
              {
                text,

                clientMessageId:
                  localMessage.clientMessageId,
              }
            );


          if (
            serverMessage
          ) {

            await ChatStorage.updateMessage(
              currentUserIdString,
              serverMessage
            );


            setMessages(
              (
                previous
              ) =>
                mergeMessages(
                  previous,
                  [serverMessage]
                )
            );

          }

        } catch (
          error
        ) {

          console.error(
            "❌ REST message send failed:",
            error
          );

          // Message remains locally queued.

        } finally {

          setSending(false);

        }

        return;

      }


      // ======================================
      // OFFLINE
      // ======================================

      console.log(
        "📴 Offline — message queued locally"
      );

      setSending(false);

    };


  // ==========================================
  // KEYBOARD
  // ==========================================

  const handleKeyDown =
    (
      event
    ) => {

      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage();

      }

    };


  // ==========================================
  // STATUS
  // ==========================================

  const getStatus = (message) => {
  if (message.senderId !== currentUserIdString) {
    return null;
  }

  switch (message.status) {
    case "read":
      return "read";

    case "delivered":
      return "delivered";

    case "sent":
      return "sent";

    case "failed":
      return "failed";

    default:
      return "pending";
  }
};


  // ==========================================
  // AVATAR
  // ==========================================

  const renderAvatar =
    () => {

      if (
        selectedUser?.profileImage
      ) {

        return (

          <img
            src={
              selectedUser.profileImage
            }
            alt={
              selectedName
            }
            className="chat-user-avatar"
          />

        );

      }


      return (

        <div
          className="
            chat-user-avatar
            chat-user-avatar-placeholder
          "
        >

          {
            selectedInitial
          }

        </div>

      );

    };


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <section
      className="
        real-chat-window
      "
    >

      {/* ======================================
          CHAT HEADER
      ======================================= */}

      <header
        className="
          chat-window-header
        "
      >

        <div
          className="
            chat-header-left
          "
        >

          {onBack && (

            <button
              type="button"
              className="
                chat-back-button
              "
              onClick={
                onBack
              }
              aria-label="Back"
            >

              <FaArrowLeft />

            </button>

          )}


          <div
            className="
              chat-user-avatar-wrapper
            "
          >

            {
              renderAvatar()
            }

          </div>


          <div
            className="
              chat-user-info
            "
          >

            <h3>
              {
                selectedName
              }
            </h3>

            <span
              className={
                socketConnected
                  ? "chat-online"
                  : "chat-offline"
              }
            >

              {syncing
                ? "Syncing..."
                : socketConnected
                ? "Connected"
                : navigator.onLine
                ? "Online"
                : "Offline"}

            </span>

          </div>

        </div>

      </header>


      {/* ======================================
          MESSAGE AREA
      ======================================= */}

      <main
        className="
          chat-messages
        "
      >

        {loading ? (

          <div
            className="
              chat-empty-state
            "
          >

            <div
              className="
                chat-loading-dot
              "
            />

            <span>
              Loading messages...
            </span>

          </div>

        ) : messages.length === 0 ? (

          <div
            className="
              chat-empty-state
            "
          >

            <div
              className="
                chat-empty-icon
              "
            >
              💬
            </div>

            <strong>
              No messages yet
            </strong>

            <span>
              Start the conversation.
            </span>

          </div>

        ) : (

          messages.map(
            (
              message
            ) => {

              const isMe =
                message.senderId ===
                currentUserIdString;


              return (

                <div
                  key={
                    getMessageKey(
                      message
                    )
                  }
                  className={
                    isMe
                      ? "chat-message-row sent"
                      : "chat-message-row received"
                  }
                >

                  <div
                    className={
                      isMe
                        ? "chat-message-bubble sent"
                        : "chat-message-bubble received"
                    }
                  >

                    <div
                      className="
                        chat-message-text
                      "
                    >
                      {
                        message.text
                      }
                    </div>


                    <div
                      className="
                        chat-message-meta
                      "
                    >

                      <time>
                        {
                          new Date(
                            message.createdAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour:
                                "2-digit",

                              minute:
                                "2-digit",
                            }
                          )
                        }
                      </time>


                      {isMe && (
                        <span
                          className={`chat-message-status status-${getStatus(message)}`}
                          aria-label={{
                            pending: "Sending",
                            sent: "Sent",
                            delivered: "Delivered",
                            read: "Read",
                            failed: "Failed to send",
                          }[getStatus(message)]}
                        >
                          {{
                            pending: "◷",
                            sent: "✓",
                            delivered: "✓✓",
                            read: "✓✓",
                            failed: "!",
                          }[getStatus(message)]}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              );

            }
          )

        )}


        <div
          ref={
            messagesEndRef
          }
          className="
            chat-scroll-anchor
          "
        />

      </main>


      {/* ======================================
          INPUT AREA
      ======================================= */}

      <footer
        className="
          chat-input-area
        "
      >

        <textarea
          ref={
            textareaRef
          }
          value={
            input
          }
          onChange={
            (
              event
            ) =>
              setInput(
                event.target.value
              )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder={
            navigator.onLine
              ? "Type a message..."
              : "Offline — message will be sent when you're back online"
          }
          rows={1}
          aria-label="Message"
        />


        <button
          type="button"
          className="
            chat-send-button
          "
          onClick={
            sendMessage
          }
          disabled={
            !input.trim() ||
            sending
          }
          aria-label="Send message"
        >

          <FaPaperPlane />

        </button>

      </footer>

    </section>

  );

}