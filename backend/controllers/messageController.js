const Connection =
  require(
    "../models/Connection"
  );


const {
  getChatHistory,
  markConversationRead,
} =
  require(
    "../services/messageService"
  );


// ==========================================
// GET CHAT MESSAGES
// ==========================================

const getMessages =
  async (
    req,
    res
  ) => {

    try {

      // ======================================
      // CURRENT USER
      // ======================================

      const userId =
        req.user.id.toString();


      // ======================================
      // OTHER USER
      // ======================================

      const otherUserId =
        req.params.userId;


      // ======================================
      // CHECK CONNECTION
      // ======================================

      const connection =
        await Connection.findOne({

          status:
            "accepted",

          $or:
            [

              {

                sender:
                  userId,

                receiver:
                  otherUserId,

              },

              {

                sender:
                  otherUserId,

                receiver:
                  userId,

              },

            ],

        });


      // ======================================
      // NOT CONNECTED
      // ======================================

      if (
        !connection
      ) {

        return res

          .status(
            403
          )

          .json({

            success:
              false,

            message:
              "You are not connected with this user",

          });

      }


      // ======================================
      // GET CHAT HISTORY
      // ======================================

      const messages =
        await getChatHistory({

          userId,

          otherUserId,

        });


      // ======================================
      // MARK AS READ
      // ======================================

      await markConversationRead({

        userId,

        otherUserId,

      });


      // ======================================
      // RESPONSE
      // ======================================

      return res.json({

        success:
          true,

        messages:
          messages || [],

      });

    }

    catch (
      error
    ) {

      console.error(

        "GET MESSAGES ERROR:",

        error

      );


      return res

        .status(
          500
        )

        .json({

          success:
            false,

          message:
            "Failed to load messages",

        });

    }

  };


// ==========================================
// EXPORT
// ==========================================

module.exports = {

  getMessages,

};