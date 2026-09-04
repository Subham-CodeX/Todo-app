import {
  useEffect,
  useState,
} from "react";

import {
  FaPaperPlane,
} from "react-icons/fa";

import {
  getSentRequests,
} from "../../services/connectionApi";

import ConnectionUserCard from
  "./ConnectionUserCard";


export default function SentRequests() {

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


  useEffect(
    () => {

      const loadRequests =
        async () => {

          try {

            const data =
              await getSentRequests();


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


      loadRequests();

    },
    []
  );


  if (
    loading
  ) {

    return (

      <div
        className="
          chat-loading
        "
      >

        Loading sent requests...

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

            Sent Requests

          </h2>

          <p>

            Connection requests
            waiting for a response.

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

              You have not sent any
              pending requests.

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
                        request.receiver
                      }

                    >

                      <span
                        className="
                          pending-badge
                        "
                      >

                        <FaPaperPlane />

                        Request Sent

                      </span>

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