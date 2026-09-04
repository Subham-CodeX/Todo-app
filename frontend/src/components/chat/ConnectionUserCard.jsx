import {
  FaUserCircle,
} from "react-icons/fa";


export default function ConnectionUserCard({

  user,

  children,

}) {

  return (

    <div
      className="
        connection-user-card
      "
    >

      {/* USER IMAGE */}

      <div
        className="
          connection-user-avatar
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

              <FaUserCircle />

            )
        }

      </div>


      {/* USER INFO */}

      <div
        className="
          connection-user-info
        "
      >

        <h3>

          {
            user.name
          }

        </h3>


        {
          user.role &&
          (

            <p
              className="
                connection-user-role
              "
            >

              {
                user.role
              }

            </p>

          )
        }


        {
          user.bio &&
          (

            <p
              className="
                connection-user-bio
              "
            >

              {
                user.bio
              }

            </p>

          )
        }

      </div>


      {/* ACTIONS */}

      <div
        className="
          connection-user-actions
        "
      >

        {
          children
        }

      </div>

    </div>

  );

}