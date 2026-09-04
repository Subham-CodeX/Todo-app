import {
  useEffect,
  useState,
} from "react";

import {
  FaComments,
  FaBan,
} from "react-icons/fa";

import {
  getConnectedUsers,
  blockUser,
} from "../../services/connectionApi";

import ConnectionUserCard from
  "./ConnectionUserCard";


export default function ConnectedUsers({

  onOpenChat,

}) {

  // =====================================
  // STATE
  // =====================================

  const [
    users,
    setUsers,
  ] =
    useState(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(
      null
    );


  // =====================================
  // LOAD CONNECTED USERS
  // =====================================

  useEffect(
    () => {

      const loadUsers =
        async () => {

          try {

            const data =
              await getConnectedUsers();


            setUsers(
              data.users ||
              []
            );


          } catch (
            error
          ) {

            console.error(
              error
            );

          } finally {

            setLoading(
              false
            );

          }

        };


      loadUsers();

    },
    []
  );


  // =====================================
  // BLOCK USER
  // =====================================

  const handleBlock =
    async (
      connectionUser
    ) => {

      const confirmed =
        window.confirm(

          `Block ${connectionUser.name}?`

        );


      if (
        !confirmed
      ) {

        return;

      }


      try {

        setActionLoading(
          connectionUser._id
        );


        await blockUser(
          connectionUser._id
        );


        // Remove blocked user
        // from connected users list

        setUsers(
          (
            current
          ) =>
            current.filter(
              (
                item
              ) =>
                item.user._id !==
                connectionUser._id
            )
        );


      } catch (
        error
      ) {

        alert(

          error.response
            ?.data
            ?.message ||
          "Failed to block user"

        );

      } finally {

        setActionLoading(
          null
        );

      }

    };


  // =====================================
  // OPEN CHAT
  // =====================================

  const handleOpenChat =
    (
      user
    ) => {

      if (
        !onOpenChat
      ) {

        return;

      }


      onOpenChat(
        user
      );

    };


  // =====================================
  // LOADING STATE
  // =====================================

  if (
    loading
  ) {

    return (

      <div
        className="
          chat-loading
        "
      >

        Loading connected users...

      </div>

    );

  }


  // =====================================
  // MAIN UI
  // =====================================

  return (

    <div
      className="
        chat-section
      "
    >

      {/* ===============================
          SECTION HEADER
      =============================== */}

      <div
        className="
          chat-section-header
        "
      >

        <div>

          <h2>

            Connected Users

          </h2>

          <p>

            People you can
            securely chat with.

          </p>

        </div>

      </div>


      {/* ===============================
          EMPTY STATE
      =============================== */}

      {
        users.length ===
        0

          ? (

            <div
              className="
                chat-empty-state
              "
            >

              You have no connections yet.
              Search for people to connect.

            </div>

          )

          : (

            <div
              className="
                connection-users-list
              "
            >

              {
                users.map(
                  (
                    item
                  ) => (

                    <ConnectionUserCard

                      key={
                        item.connectionId
                      }

                      user={
                        item.user
                      }

                    >

                      {/* ===================
                          OPEN CHAT
                      =================== */}

                      <button

                        className="
                          chat-user-btn
                        "

                        onClick={() =>
                          handleOpenChat(
                            item.user
                          )
                        }

                      >

                        <FaComments />

                        Chat

                      </button>


                      {/* ===================
                          BLOCK USER
                      =================== */}

                      <button

                        className="
                          block-btn
                        "

                        disabled={
                          actionLoading ===
                          item.user._id
                        }

                        onClick={() =>
                          handleBlock(
                            item.user
                          )
                        }

                      >

                        <FaBan />

                        {
                          actionLoading ===
                          item.user._id

                            ? "Blocking..."

                            : "Block"
                        }

                      </button>

                    </ConnectionUserCard>

                  )
                )
              }

            </div>

          )
      }

    </div>

  );

}