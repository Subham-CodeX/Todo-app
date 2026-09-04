import {
  useEffect,
  useState,
} from "react";

import {
  FaCheck,
  FaTimes,
} from "react-icons/fa";

import {
  getIncomingRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
} from "../../services/connectionApi";

import ConnectionUserCard from
  "./ConnectionUserCard";


export default function IncomingRequests() {

  const [
    requests,
    setRequests,
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


  const loadRequests =
    async () => {

      try {

        setLoading(
          true
        );


        const data =
          await getIncomingRequests();


        setRequests(
          data.requests ||
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


  useEffect(
    () => {

      loadRequests();

    },
    []
  );


  const handleAccept =
    async (
      connectionId
    ) => {

      try {

        setActionLoading(
          connectionId
        );


        await
          acceptConnectionRequest(
            connectionId
          );


        setRequests(
          (
            current
          ) =>
            current.filter(
              (
                request
              ) =>
                request._id !==
                connectionId
            )
        );


      } catch (
        error
      ) {

        alert(

          error.response
            ?.data
            ?.message ||
          "Failed to accept request"

        );

      } finally {

        setActionLoading(
          null
        );

      }

    };


  const handleReject =
    async (
      connectionId
    ) => {

      try {

        setActionLoading(
          connectionId
        );


        await
          rejectConnectionRequest(
            connectionId
          );


        setRequests(
          (
            current
          ) =>
            current.filter(
              (
                request
              ) =>
                request._id !==
                connectionId
            )
        );


      } catch (
        error
      ) {

        alert(

          error.response
            ?.data
            ?.message ||
          "Failed to reject request"

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

        Loading incoming requests...

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

            Incoming Requests

          </h2>

          <p>

            People who want
            to connect with you.

          </p>

        </div>

      </div>


      {
        requests.length ===
        0

          ? (

            <div
              className="
                chat-empty-state
              "
            >

              No incoming connection requests.

            </div>

          )

          : (

            <div
              className="
                connection-users-list
              "
            >

              {
                requests.map(
                  (
                    request
                  ) => (

                    <ConnectionUserCard

                      key={
                        request._id
                      }

                      user={
                        request.sender
                      }

                    >

                      <button

                        className="
                          accept-btn
                        "

                        disabled={
                          actionLoading ===
                          request._id
                        }

                        onClick={() =>
                          handleAccept(
                            request._id
                          )
                        }

                      >

                        <FaCheck />

                        Accept

                      </button>


                      <button

                        className="
                          reject-btn
                        "

                        disabled={
                          actionLoading ===
                          request._id
                        }

                        onClick={() =>
                          handleReject(
                            request._id
                          )
                        }

                      >

                        <FaTimes />

                        Reject

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