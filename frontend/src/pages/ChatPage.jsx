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

import {
  useAuth,
} from "../context/AuthContext";

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

import ChatWindow from
  "../components/chat/ChatWindow";

import "../styles/chat.css";


// ============================================
// CHAT PAGE
// ============================================

export default function ChatPage() {

  // ==========================================
  // AUTHENTICATED USER
  // ==========================================

  const {
    user,
  } = useAuth();


  // ==========================================
  // ACTIVE CONNECTION TAB
  // ==========================================

  const [
    activeTab,
    setActiveTab,
  ] =
    useState(
      "connected"
    );


  // ==========================================
  // SELECTED CHAT USER
  // ==========================================

  const [
    selectedChatUser,
    setSelectedChatUser,
  ] =
    useState(
      null
    );


  // ==========================================
  // CHAT SIDEBAR TABS
  // ==========================================

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


  // ==========================================
  // OPEN CHAT
  // ==========================================

  const openChat =
    (
      selectedUser
    ) => {

      console.log(
        "💬 Opening chat with:",
        selectedUser
      );

      setSelectedChatUser(
        selectedUser
      );

    };


  // ==========================================
  // CLOSE CHAT
  // ==========================================

  const closeChat =
    () => {

      setSelectedChatUser(
        null
      );

    };


  // ==========================================
  // CHANGE TAB
  // ==========================================

  const handleTabChange =
    (
      tab
    ) => {

      // Close active conversation

      setSelectedChatUser(
        null
      );

      setActiveTab(
        tab
      );

    };


  // ==========================================
  // RENDER CHAT CONTENT
  // ==========================================

  const renderContent =
    () => {

      // ======================================
      // OPEN REAL CHAT WINDOW
      // ======================================

      if (
        selectedChatUser
      ) {

        return (

          <ChatWindow

            // ================================
            // CURRENT LOGGED-IN USER
            // ================================

            user={
              user
            }

            // ================================
            // PERSON WE ARE CHATTING WITH
            // ================================

            selectedUser={
              selectedChatUser
            }

            // ================================
            // MOBILE BACK
            // ================================

            onBack={
              closeChat
            }

          />

        );

      }


      // ======================================
      // CONNECTION SYSTEM TABS
      // ======================================

      switch (
        activeTab
      ) {

        // ------------------------------------
        // SEARCH PEOPLE
        // ------------------------------------

        case "search":

          return (
            <SearchPeople />
          );


        // ------------------------------------
        // INCOMING REQUESTS
        // ------------------------------------

        case "incoming":

          return (
            <IncomingRequests />
          );


        // ------------------------------------
        // SENT REQUESTS
        // ------------------------------------

        case "sent":

          return (
            <SentRequests />
          );


        // ------------------------------------
        // BLOCKED USERS
        // ------------------------------------

        case "blocked":

          return (
            <BlockedUsers />
          );


        // ------------------------------------
        // CONNECTED USERS
        // ------------------------------------

        case "connected":

        default:

          return (

            <ConnectedUsers

              onOpenChat={
                openChat
              }

            />

          );

      }

    };


  // ==========================================
  // AUTH LOADING / USER NOT AVAILABLE
  // ==========================================

  if (
    !user
  ) {

    return (

      <div
        className="
          chat-page
        "
      >

        <div
          className="
            chat-empty-state
          "
        >

          Loading user...

        </div>

      </div>

    );

  }


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div
      className="
        chat-page
      "
    >

      {/* ====================================
          HEADER
      ==================================== */}

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


      {/* ====================================
          MAIN CHAT LAYOUT
      ==================================== */}

      <div
        className="
          chat-layout
        "
      >

        {/* ==================================
            CONNECTION SIDEBAR
        ================================== */}

        <ChatSidebar

          tabs={
            tabs
          }

          activeTab={
            activeTab
          }

          setActiveTab={
            handleTabChange
          }

        />


        {/* ==================================
            MAIN CONTENT
        ================================== */}

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