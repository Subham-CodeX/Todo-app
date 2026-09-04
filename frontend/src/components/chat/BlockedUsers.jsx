import {
  useEffect,
  useState,
} from "react";

import {
  FaUnlock,
  FaBan,
} from "react-icons/fa";

import {
  getBlockedUsers,
  unblockUser,
} from "../../services/connectionApi";

import ConnectionUserCard from
  "./ConnectionUserCard";


export default function BlockedUsers() {

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


  useEffect(
    () => {

      const loadBlockedUsers =
        async () => {

          try {

            const data =
              await getBlockedUsers();


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


      loadBlockedUsers();

    },
    []
  );


  const handleUnblock =
    async (
      blockedUser
    ) => {

      try {

        setActionLoading(
          blockedUser._id
        );


        await
          unblockUser(
            blockedUser._id
          );


        setUsers(
          (
            current
          ) =>
            current.filter(
              (
                item
              ) =>
                item.user._id !==
                blockedUser._id
            )
        );


      } catch (
        error
      ) {

        alert(

          error.response
            ?.data
            ?.message ||
          "Failed to unblock user"

        );

      } finally {

        setActionLoading(
          null
        );

      }

    };


  if (
    loading
  ) {

    return (

      <div
        className="
          chat-loading
        "
      >

        Loading blocked users...

      </div>

    );

  }


  return (

    <div
      className="
        chat-section
      "
    >

      <div
        className="
          chat-section-header
        "
      >

        <div>

          <h2>

            Blocked Users

          </h2>

          <p>

            Manage people you
            have blocked.

          </p>

        </div>

      </div>


      {
        users.length ===
        0

          ? (

            <div
              className="
                chat-empty-state
              "
            >

              <FaBan />

              <p>

                You haven't blocked
                anyone.

              </p>

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

                      <button

                        className="
                          unblock-btn
                        "

                        disabled={
                          actionLoading ===
                          item.user._id
                        }

                        onClick={() =>
                          handleUnblock(
                            item.user
                          )
                        }

                      >

                        <FaUnlock />

                        {
                          actionLoading ===
                          item.user._id

                            ? "Unblocking..."

                            : "Unblock"
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