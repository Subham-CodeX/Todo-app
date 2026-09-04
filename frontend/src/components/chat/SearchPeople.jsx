import {
  useState,
} from "react";

import {
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";

import {
  searchUsers,
  sendConnectionRequest,
} from "../../services/connectionApi";

import ConnectionUserCard from
  "./ConnectionUserCard";


export default function SearchPeople() {

  const [
    query,
    setQuery,
  ] =
    useState(
      ""
    );

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
      false
    );

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(
      null
    );

  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  // ========================================
  // SEARCH
  // ========================================

  const handleSearch =
    async (
      event
    ) => {

      event.preventDefault();

      const cleanQuery =
        query.trim();


      if (
        !cleanQuery
      ) {

        setUsers(
          []
        );

        return;

      }


      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        const data =
          await searchUsers(
            cleanQuery
          );


        setUsers(
          data.users ||
          []
        );


      } catch (
        error
      ) {

        setError(
          error.response
            ?.data
            ?.message ||
          "Failed to search users"
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  // ========================================
  // SEND REQUEST
  // ========================================

  const handleSendRequest =
    async (
      userId
    ) => {

      try {

        setActionLoading(
          userId
        );


        await
          sendConnectionRequest(
            userId
          );


        setUsers(
          (
            currentUsers
          ) =>
            currentUsers.map(
              (
                user
              ) =>

                user._id ===
                userId

                  ? {
                      ...user,

                      requestSent:
                        true,
                    }

                  : user

            )
        );


      } catch (
        error
      ) {

        alert(

          error.response
            ?.data
            ?.message ||
          "Failed to send request"

        );

      } finally {

        setActionLoading(
          null
        );

      }

    };


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

            Search People

          </h2>

          <p>

            Find TaskFlow users
            and send a connection
            request.

          </p>

        </div>

      </div>


      {/* SEARCH FORM */}

      <form
        className="
          people-search-form
        "

        onSubmit={
          handleSearch
        }
      >

        <div
          className="
            people-search-input
          "
        >

          <FaSearch />

          <input

            type="text"

            placeholder="
              Search by name or email...
            "

            value={
              query
            }

            onChange={
              (
                event
              ) =>
                setQuery(
                  event
                    .target
                    .value
                )
            }

          />

        </div>


        <button
          type="submit"
          className="
            primary-chat-btn
          "
        >

          Search

        </button>

      </form>


      {/* ERROR */}

      {
        error &&
        (

          <div
            className="
              chat-error
            "
          >

            {
              error
            }

          </div>

        )
      }


      {/* LOADING */}

      {
        loading &&
        (

          <div
            className="
              chat-loading
            "
          >

            Searching users...

          </div>

        )
      }


      {/* RESULTS */}

      {
        !loading &&
        users.length >
        0 &&
        (

          <div
            className="
              connection-users-list
            "
          >

            {
              users.map(
                (
                  user
                ) => (

                  <ConnectionUserCard

                    key={
                      user._id
                    }

                    user={
                      user
                    }

                  >

                    <button

                      className="
                        connect-btn
                      "

                      disabled={
                        user.requestSent ||
                        actionLoading ===
                          user._id
                      }

                      onClick={() =>
                        handleSendRequest(
                          user._id
                        )
                      }

                    >

                      <FaUserPlus />

                      {
                        actionLoading ===
                        user._id

                          ? "Sending..."

                          : user.requestSent

                            ? "Request Sent"

                            : "Connect"
                      }

                    </button>

                  </ConnectionUserCard>

                )
              )
            }

          </div>

        )
      }


      {/* EMPTY */}

      {
        !loading &&
        query &&
        users.length ===
        0 &&
        !error &&
        (

          <div
            className="
              chat-empty-state
            "
          >

            No users found.

          </div>

        )
      }

    </div>

  );

}