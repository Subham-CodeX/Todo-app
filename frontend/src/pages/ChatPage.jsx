import {
  useState,
} from "react";

import {
  FaSearch,
  FaInbox,
  FaPaperPlane,
  FaUsers,
  FaBan,
  FaComments,
} from "react-icons/fa";

import ChatSidebar from
  "../components/chat/ChatSidebar";

import SearchPeople from
  "../components/chat/SearchPeople";

import IncomingRequests from
  "../components/chat/IncomingRequests";

import SentRequests from
  "../components/chat/SentRequests";

import ConnectedUsers from
  "../components/chat/ConnectedUsers";

import BlockedUsers from
  "../components/chat/BlockedUsers";

import "../styles/chat.css";


export default function ChatPage() {

  const [
    activeTab,
    setActiveTab,
  ] =
    useState(
      "connected"
    );


  const tabs = [

    {
      id:
        "search",

      label:
        "Search People",

      icon:
        <FaSearch />,
    },

    {
      id:
        "incoming",

      label:
        "Incoming Requests",

      icon:
        <FaInbox />,
    },

    {
      id:
        "sent",

      label:
        "Sent Requests",

      icon:
        <FaPaperPlane />,
    },

    {
      id:
        "connected",

      label:
        "Connected Users",

      icon:
        <FaUsers />,
    },

    {
      id:
        "blocked",

      label:
        "Blocked Users",

      icon:
        <FaBan />,
    },

  ];


  const renderContent =
    () => {

      switch (
        activeTab
      ) {

        case "search":

          return (
            <SearchPeople />
          );


        case "incoming":

          return (
            <IncomingRequests />
          );


        case "sent":

          return (
            <SentRequests />
          );


        case "blocked":

          return (
            <BlockedUsers />
          );


        case "connected":

        default:

          return (
            <ConnectedUsers />
          );

      }

    };


  return (

    <div
      className="
        chat-page
      "
    >

      {/* HEADER */}

      <div
        className="
          chat-page-header
        "
      >

        <div>

          <h1>

            <FaComments />

            Chat

          </h1>

          <p>

            Connect with people and
            start secure conversations.

          </p>

        </div>

      </div>


      {/* MAIN */}

      <div
        className="
          chat-layout
        "
      >

        {/* SIDEBAR */}

        <ChatSidebar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />


        {/* CONTENT */}

        <div
          className="
            chat-content
          "
        >

          {
            renderContent()
          }

        </div>

      </div>

    </div>

  );

}