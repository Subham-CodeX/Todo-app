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


export default function ChatWindow({

  user,

  onBack,

}) {

  const [
    messages,
    setMessages,
  ] =
    useState(
      []
    );

  const [
    input,
    setInput,
  ] =
    useState(
      ""
    );

  const messagesEndRef =
    useRef(
      null
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
  // RECEIVE MESSAGE
  // ========================================

  useEffect(
    () => {

      const socket =
        getSocket();


      if (
        !socket
      ) {

        return;

      }


      const handleReceiveMessage =
        (
          message
        ) => {

          if (
            message.senderId ===
            user._id
          ) {

            setMessages(
              (
                current
              ) => [

                ...current,

                message,

              ]
            );

          }

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
    ]
  );


  // ========================================
  // MESSAGE SENT EVENT
  // ========================================

  useEffect(
    () => {

      const socket =
        getSocket();


      if (
        !socket
      ) {

        return;

      }


      const handleMessageSent =
        (
          message
        ) => {

          if (
            message.receiverId ===
            user._id
          ) {

            setMessages(
              (
                current
              ) => {

                const exists =
                  current.some(
                    (
                      item
                    ) =>
                      item.id ===
                      message.id
                  );


                if (
                  exists
                ) {
                  return current;
                }


                return [

                  ...current,

                  message,

                ];

              }
            );

          }

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


      if (
        !text
      ) {

        return;

      }


      const socket =
        getSocket();


      if (
        !socket ||
        !socket.connected
      ) {

        alert(
          "Chat server is not connected"
        );

        return;

      }


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
            !response.success
          ) {

            alert(
              response.message ||
              "Failed to send message"
            );

            return;

          }

        }
      );


      setInput(
        ""
      );

    };


  return (

    <div
      className="
        real-chat-window
      "
    >

      {/* HEADER */}

      <div
        className="
          real-chat-header
        "
      >

        <button

          className="
            chat-back-btn
          "

          onClick={
            onBack
          }

        >

          <FaArrowLeft />

        </button>


        <div
          className="
            real-chat-user
          "
        >

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
                      user.name
                    }
                  />

                )
                : (

                  user.name
                    ?.charAt(0)
                    ?.toUpperCase()

                )
            }

          </div>


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


      {/* MESSAGES */}

      <div
        className="
          real-chat-messages
        "
      >

        {
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


        {
          messages.map(
            (
              message
            ) => {

              const isMe =
                message.receiverId ===
                user._id;


              return (

                <div

                  key={
                    message.id
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
                      message.text
                    }

                  </div>

                </div>

              );

            }
          )
        }


        <div
          ref={
            messagesEndRef
          }
        />

      </div>


      {/* INPUT */}

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

        />


        <button
          type="submit"
        >

          <FaPaperPlane />

        </button>

      </form>

    </div>

  );

}