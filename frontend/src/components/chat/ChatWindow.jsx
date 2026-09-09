import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaPaperPlane,
  FaArrowLeft,
} from "react-icons/fa";

import {
  getSocket,
} from "../../services/socket";

import {
  getChatMessages,
} from "../../services/messageApi";

export default function ChatWindow({

  user,
  onBack,

}) {

  // ========================================
  // MESSAGES
  // ========================================

  const [
    messages,
    setMessages,
  ] =
    useState(
      []
    );

  // ========================================
  // LOADING
  // ========================================

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  // ========================================
  // INPUT
  // ========================================

  const [
    input,
    setInput,
  ] =
    useState(
      ""
    );


  // ========================================
  // MESSAGE END REF
  // ========================================

  const messagesEndRef =
    useRef(
      null
    );

  // ========================================
  // SOCKET REF
  // ========================================

  const socket =
    getSocket();

  // ========================================
  // MESSAGE ID HELPER
  // ========================================

  const getMessageId =
    (
      message
    ) => {

      return (

        message.id ||

        message.message_id ||

        `${

          message.senderId ||

          message.sender_id

        }-${

          message.receiverId ||

          message.receiver_id

        }-${

          message.createdAt ||

          message.created_at

        }-${

          message.text ||

          message.message ||

          ""

        }`

      );

    };

  // ========================================
  // GET SENDER ID
  // ========================================

  const getSenderId =
    (
      message
    ) => {

      return (

        message.senderId ||

        message.sender_id

      );

    };

  // ========================================
  // GET RECEIVER ID
  // ========================================

  const getReceiverId =
    (
      message
    ) => {

      return (

        message.receiverId ||

        message.receiver_id

      );

    };

  // ========================================
  // GET MESSAGE TEXT
  // ========================================

  const getMessageText =
    (
      message
    ) => {

      return (

        message.text ||

        message.message ||

        ""

      );

    };


  // ========================================
  // NORMALIZE MESSAGE
  // ========================================

  const normalizeMessage =
    (
      message
    ) => {

      if (
        !message
      ) {

        return null;

      }


      return {

        ...message,

        id:
          getMessageId(
            message
          ),

        senderId:
          getSenderId(
            message
          ),

        receiverId:
          getReceiverId(
            message
          ),

        text:
          getMessageText(
            message
          ),

        createdAt:

          message.createdAt ||

          message.created_at ||

          new Date().toISOString(),

      };

    };


  // ========================================
  // LOAD PERSISTENT CHAT HISTORY
  // ========================================

  useEffect(

    () => {

      const loadMessages =
        async () => {

          try {

            setLoading(
              true
            );


            const data =
              await getChatMessages(

                user._id

              );


            const loadedMessages =
              (
                data.messages ||
                []
              )
                .map(
                  (
                    message
                  ) =>
                    normalizeMessage(
                      message
                    )
                )
                .filter(
                  Boolean
                );


            setMessages(
              loadedMessages
            );

          }

          catch (
            error
          ) {

            console.error(

              "LOAD CHAT ERROR:",

              error

            );


            setMessages(
              []
            );

          }

          finally {

            setLoading(
              false
            );

          }

        };


      loadMessages();

    },

    [
      user._id,
    ]

  );


  // ========================================
  // RECEIVE REAL-TIME MESSAGE
  // ========================================

  useEffect(

    () => {

      if (
        !socket
      ) {

        return;

      }


      const handleReceiveMessage =
        (
          message
        ) => {

          const normalizedMessage =
            normalizeMessage(
              message
            );


          if (
            !normalizedMessage
          ) {

            return;

          }


          const senderId =
            normalizedMessage.senderId;


          // --------------------------------
          // ONLY CURRENT CHAT
          // --------------------------------

          if (
            senderId !==
            user._id
          ) {

            return;

          }


          setMessages(

            (
              previous
            ) => {

              const messageId =
                normalizedMessage.id;


              const alreadyExists =
                previous.some(

                  (
                    item
                  ) =>
                    getMessageId(
                      item
                    ) ===
                    messageId

                );


              if (
                alreadyExists
              ) {

                return previous;

              }


              return [

                ...previous,

                normalizedMessage,

              ];

            }

          );

        };


      socket.on(

        "receive_message",

        handleReceiveMessage

      );


      return () => {

        socket.off(

          "receive_message",

          handleReceiveMessage

        );

      };

    },

    [
      user._id,
      socket,
    ]

  );


  // ========================================
  // MESSAGE SENT EVENT
  // ========================================

  useEffect(

    () => {

      if (
        !socket
      ) {

        return;

      }


      const handleMessageSent =
        (
          message
        ) => {

          const normalizedMessage =
            normalizeMessage(
              message
            );


          if (
            !normalizedMessage
          ) {

            return;

          }


          // --------------------------------
          // ONLY CURRENT CHAT
          // --------------------------------

          if (

            normalizedMessage.receiverId !==
            user._id

          ) {

            return;

          }


          setMessages(

            (
              previous
            ) => {

              const messageId =
                normalizedMessage.id;


              const alreadyExists =
                previous.some(

                  (
                    item
                  ) =>
                    getMessageId(
                      item
                    ) ===
                    messageId

                );


              if (
                alreadyExists
              ) {

                return previous;

              }


              return [

                ...previous,

                normalizedMessage,

              ];

            }

          );

        };


      socket.on(

        "message_sent",

        handleMessageSent

      );


      return () => {

        socket.off(

          "message_sent",

          handleMessageSent

        );

      };

    },

    [
      user._id,
      socket,
    ]

  );


  // ========================================
  // RECEIVE OFFLINE MESSAGES
  // ========================================

  useEffect(

    () => {

      if (
        !socket
      ) {

        return;

      }


      const handleOfflineMessages =
        (
          offlineMessages
        ) => {

          if (
            !Array.isArray(
              offlineMessages
            )
          ) {

            return;

          }


          // --------------------------------
          // NORMALIZE
          // --------------------------------

          const normalizedMessages =
            offlineMessages
              .map(
                (
                  message
                ) =>
                  normalizeMessage(
                    message
                  )
              )
              .filter(
                Boolean
              );


          // --------------------------------
          // CURRENT CONVERSATION ONLY
          // --------------------------------

          const relevantMessages =
            normalizedMessages.filter(

              (
                message
              ) => {

                const senderId =
                  message.senderId;


                const receiverId =
                  message.receiverId;


                return (

                  senderId ===
                    user._id

                  ||

                  receiverId ===
                    user._id

                );

              }

            );


          if (
            relevantMessages.length ===
            0
          ) {

            return;

          }


          setMessages(

            (
              previous
            ) => {

              const combined = [

                ...previous,

                ...relevantMessages,

              ];


              // --------------------------------
              // REMOVE DUPLICATES
              // --------------------------------

              const uniqueMessages =
                Array.from(

                  new Map(

                    combined.map(

                      (
                        item
                      ) => [

                        getMessageId(
                          item
                        ),

                        item,

                      ]

                    )

                  ).values()

                );


              // --------------------------------
              // SORT BY CREATED TIME
              // --------------------------------

              uniqueMessages.sort(

                (
                  first,
                  second
                ) => {

                  return (

                    new Date(
                      first.createdAt
                    ) -

                    new Date(
                      second.createdAt
                    )

                  );

                }

              );


              return uniqueMessages;

            }

          );

        };


      socket.on(

        "offline_messages",

        handleOfflineMessages

      );


      return () => {

        socket.off(

          "offline_messages",

          handleOfflineMessages

        );

      };

    },

    [
      user._id,
      socket,
    ]

  );


  // ========================================
  // SCROLL TO BOTTOM
  // ========================================

  useEffect(

    () => {

      messagesEndRef.current
        ?.scrollIntoView(

          {
            behavior:
              "smooth",
          }

        );

    },

    [
      messages,
    ]

  );


  // ========================================
  // SEND MESSAGE
  // ========================================

  const handleSend =
    (
      event
    ) => {

      event.preventDefault();


      const text =
        input.trim();


      // --------------------------------
      // EMPTY MESSAGE
      // --------------------------------

      if (
        !text
      ) {

        return;

      }


      // --------------------------------
      // SOCKET CHECK
      // --------------------------------

      if (

        !socket ||

        !socket.connected

      ) {

        alert(

          "Chat server is not connected"

        );

        return;

      }


      // --------------------------------
      // SEND TO SERVER
      // --------------------------------

      socket.emit(

        "send_message",

        {

          receiverId:
            user._id,

          text,

        },

        (
          response
        ) => {

          if (
            !response?.success
          ) {

            alert(

              response?.message ||

              "Failed to send message"

            );

            return;

          }

        }

      );


      // --------------------------------
      // CLEAR INPUT
      // --------------------------------

      setInput(
        ""
      );

    };


  // ========================================
  // HANDLE ENTER KEY
  // ========================================

  const handleKeyDown =
    (
      event
    ) => {

      if (
        event.key ===
        "Enter"
      ) {

        if (
          event.shiftKey
        ) {

          return;

        }


        event.preventDefault();


        const form =
          event.currentTarget
            .form;


        form?.requestSubmit();

      }

    };


  // ========================================
  // RENDER
  // ========================================

  return (

    <div
      className="
        real-chat-window
      "
    >

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div
        className="
          real-chat-header
        "
      >

        <button

          type="button"

          className="
            chat-back-btn
          "

          onClick={
            onBack
          }

          aria-label="
            Back to chats
          "

        >

          <FaArrowLeft />

        </button>


        <div
          className="
            real-chat-user
          "
        >

          {/* AVATAR */}

          <div
            className="
              real-chat-avatar
            "
          >

            {
              user.profileImage

                ? (

                  <img

                    src={
                      user.profileImage
                    }

                    alt={
                      user.name ||
                      "User"
                    }

                  />

                )

                : (

                  user.name
                    ?.charAt(0)
                    ?.toUpperCase() ||

                  "U"

                )

            }

          </div>


          {/* USER INFO */}

          <div>

            <h3>

              {
                user.name
              }

            </h3>


            <span>

              Connected

            </span>

          </div>

        </div>

      </div>


      {/* ================================== */}
      {/* MESSAGES */}
      {/* ================================== */}

      <div
        className="
          real-chat-messages
        "
      >

        {/* LOADING */}

        {
          loading &&

          (

            <div
              className="
                chat-loading
              "
            >

              Loading messages...

            </div>

          )

        }


        {/* EMPTY STATE */}

        {
          !loading &&

          messages.length ===
          0 &&

          (

            <div
              className="
                chat-start-message
              "
            >

              Start your conversation
              with {user.name} 👋

            </div>

          )

        }


        {/* MESSAGE LIST */}

        {
          !loading &&

          messages.map(

            (
              message
            ) => {

              const senderId =
                getSenderId(
                  message
                );


              const receiverId =
                getReceiverId(
                  message
                );


              const messageText =
                getMessageText(
                  message
                );


              const isMe =

                receiverId ===
                user._id;


              return (

                <div

                  key={
                    getMessageId(
                      message
                    )
                  }

                  className={

                    `chat-message-row
                    ${
                      isMe

                        ? "chat-message-me"

                        : "chat-message-other"
                    }`

                  }

                >

                  <div
                    className="
                      chat-message-bubble
                    "
                  >

                    {
                      messageText
                    }

                  </div>

                </div>

              );

            }

          )

        }


        {/* SCROLL ANCHOR */}

        <div
          ref={
            messagesEndRef
          }
        />

      </div>


      {/* ================================== */}
      {/* INPUT */}
      {/* ================================== */}

      <form

        className="
          real-chat-input-area
        "

        onSubmit={
          handleSend
        }

      >

        <input

          type="text"

          placeholder="
            Type a message...
          "

          value={
            input
          }

          onChange={

            (
              event
            ) =>

              setInput(

                event
                  .target
                  .value

              )

          }

          onKeyDown={
            handleKeyDown
          }

          autoComplete="
            off
          "

        />


        <button

          type="submit"

          disabled={
            !input.trim()
          }

          aria-label="
            Send message
          "

        >

          <FaPaperPlane />

        </button>

      </form>

    </div>

  );

}