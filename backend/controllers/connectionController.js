const Connection =
  require(
    "../models/Connection"
  );

const User =
  require(
    "../models/User"
  );


// ==========================================
// HELPER
// FIND CONNECTION BETWEEN TWO USERS
// ==========================================

const findConnection =
  async (
    userA,
    userB
  ) => {

    return await Connection.findOne({
      $or: [
        {
          sender: userA,
          receiver: userB,
        },

        {
          sender: userB,
          receiver: userA,
        },
      ],
    });

  };


// ==========================================
// SEND CONNECTION REQUEST
// POST /api/connections/request/:userId
// ==========================================

exports.sendRequest =
  async (
    req,
    res
  ) => {

    try {

      const senderId =
        req.user.id;

      const receiverId =
        req.params.userId;


      // ======================================
      // Cannot connect with yourself
      // ======================================

      if (
        senderId ===
        receiverId
      ) {

        return res.status(400).json({
          success: false,
          message:
            "You cannot send a connection request to yourself",
        });

      }


      // ======================================
      // Check receiver exists
      // ======================================

      const receiver =
        await User.findById(
          receiverId
        );

      if (!receiver) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });

      }


      // ======================================
      // Check existing relationship
      // ======================================

      const existingConnection =
        await findConnection(
          senderId,
          receiverId
        );


      if (existingConnection) {

        // ----------------------------------
        // Already connected
        // ----------------------------------

        if (
          existingConnection.status ===
          "accepted"
        ) {

          return res.status(400).json({
            success: false,
            message:
              "You are already connected",
          });

        }


        // ----------------------------------
        // Pending request
        // ----------------------------------

        if (
          existingConnection.status ===
          "pending"
        ) {

          return res.status(400).json({
            success: false,

            message:
              existingConnection.sender.toString() ===
              senderId
                ? "Connection request already sent"
                : "This user has already sent you a connection request",
          });

        }


        // ----------------------------------
        // Blocked
        // ----------------------------------

        if (
          existingConnection.status ===
          "blocked"
        ) {

          return res.status(403).json({
            success: false,
            message:
              "Connection request cannot be sent",
          });

        }


        // ----------------------------------
        // Previously rejected
        // ----------------------------------

        if (
          existingConnection.status ===
          "rejected"
        ) {

          existingConnection.sender =
            senderId;

          existingConnection.receiver =
            receiverId;

          existingConnection.status =
            "pending";

          existingConnection.blockedBy =
            null;

          await existingConnection.save();

          return res.status(200).json({
            success: true,

            message:
              "Connection request sent again",

            connection:
              existingConnection,
          });

        }

      }


      // ======================================
      // Create request
      // ======================================

      const connection =
        await Connection.create({
          sender:
            senderId,

          receiver:
            receiverId,

          status:
            "pending",
        });


      res.status(201).json({
        success: true,

        message:
          "Connection request sent successfully",

        connection,
      });


    } catch (error) {

      console.error(
        "Send Connection Request Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  };


// ==========================================
// GET INCOMING REQUESTS
// GET /api/connections/requests/incoming
// ==========================================

exports.getIncomingRequests =
  async (
    req,
    res
  ) => {

    try {

      const connections =
        await Connection.find({
          receiver:
            req.user.id,

          status:
            "pending",
        })

          .populate(
            "sender",
            "_id name email profileImage role bio"
          )

          .sort({
            createdAt:
              -1,
          });


      res.status(200).json({
        success: true,
        requests:
          connections,
      });


    } catch (error) {

      console.error(
        "Get Incoming Requests Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  };


// ==========================================
// GET SENT REQUESTS
// GET /api/connections/requests/sent
// ==========================================

exports.getSentRequests =
  async (
    req,
    res
  ) => {

    try {

      const connections =
        await Connection.find({
          sender:
            req.user.id,

          status:
            "pending",
        })

          .populate(
            "receiver",
            "_id name email profileImage role bio"
          )

          .sort({
            createdAt:
              -1,
          });


      res.status(200).json({
        success: true,
        requests:
          connections,
      });


    } catch (error) {

      console.error(
        "Get Sent Requests Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  };


// ==========================================
// ACCEPT REQUEST
// PUT /api/connections/:id/accept
// ==========================================

exports.acceptRequest =
  async (
    req,
    res
  ) => {

    try {

      const connection =
        await Connection.findOne({
          _id:
            req.params.id,

          receiver:
            req.user.id,

          status:
            "pending",
        });


      if (!connection) {

        return res.status(404).json({
          success: false,
          message:
            "Connection request not found",
        });

      }


      connection.status =
        "accepted";


      await connection.save();


      const populatedConnection =
        await Connection.findById(
          connection._id
        )

          .populate(
            "sender",
            "_id name email profileImage role bio"
          )

          .populate(
            "receiver",
            "_id name email profileImage role bio"
          );


      res.status(200).json({
        success: true,

        message:
          "Connection request accepted",

        connection:
          populatedConnection,
      });


    } catch (error) {

      console.error(
        "Accept Connection Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  };


// ==========================================
// REJECT REQUEST
// PUT /api/connections/:id/reject
// ==========================================

exports.rejectRequest =
  async (
    req,
    res
  ) => {

    try {

      const connection =
        await Connection.findOne({
          _id:
            req.params.id,

          receiver:
            req.user.id,

          status:
            "pending",
        });


      if (!connection) {

        return res.status(404).json({
          success: false,
          message:
            "Connection request not found",
        });

      }


      connection.status =
        "rejected";


      await connection.save();


      res.status(200).json({
        success: true,
        message:
          "Connection request rejected",
      });


    } catch (error) {

      console.error(
        "Reject Connection Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  };


// ==========================================
// GET CONNECTED USERS
// GET /api/connections
// ==========================================

exports.getConnectedUsers =
  async (
    req,
    res
  ) => {

    try {

      const userId =
        req.user.id;


      const connections =
        await Connection.find({
          status:
            "accepted",

          $or: [
            {
              sender:
                userId,
            },

            {
              receiver:
                userId,
            },
          ],
        })

          .populate(
            "sender",
            "_id name email profileImage role bio"
          )

          .populate(
            "receiver",
            "_id name email profileImage role bio"
          )

          .sort({
            updatedAt:
              -1,
          });


      const users =
        connections.map(
          connection => {

            const sender =
              connection.sender;

            const receiver =
              connection.receiver;


            const otherUser =
              sender._id.toString() ===
              userId
                ? receiver
                : sender;


            return {
              connectionId:
                connection._id,

              connectedAt:
                connection.updatedAt,

              user:
                otherUser,
            };

          }
        );


      res.status(200).json({
        success: true,
        users,
      });


    } catch (error) {

      console.error(
        "Get Connected Users Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  };


// ==========================================
// BLOCK USER
// PUT /api/connections/block/:userId
// ==========================================

exports.blockUser =
  async (
    req,
    res
  ) => {

    try {

      const userId =
        req.user.id;

      const targetUserId =
        req.params.userId;


      if (
        userId ===
        targetUserId
      ) {

        return res.status(400).json({
          success: false,
          message:
            "You cannot block yourself",
        });

      }


      const targetUser =
        await User.findById(
          targetUserId
        );


      if (!targetUser) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });

      }


      let connection =
        await findConnection(
          userId,
          targetUserId
        );


      if (connection) {

        connection.status =
          "blocked";

        connection.blockedBy =
          userId;

        await connection.save();

      } else {

        connection =
          await Connection.create({
            sender:
              userId,

            receiver:
              targetUserId,

            status:
              "blocked",

            blockedBy:
              userId,
          });

      }


      res.status(200).json({
        success: true,
        message:
          "User blocked successfully",
      });


    } catch (error) {

      console.error(
        "Block User Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  };


// ==========================================
// UNBLOCK USER
// DELETE /api/connections/block/:userId
// ==========================================

exports.unblockUser =
  async (
    req,
    res
  ) => {

    try {

      const userId =
        req.user.id;

      const targetUserId =
        req.params.userId;


      const connection =
        await Connection.findOne({
          status:
            "blocked",

          blockedBy:
            userId,

          $or: [
            {
              sender:
                userId,

              receiver:
                targetUserId,
            },

            {
              sender:
                targetUserId,

              receiver:
                userId,
            },
          ],
        });


      if (!connection) {

        return res.status(404).json({
          success: false,
          message:
            "Blocked user not found",
        });

      }


      // Remove connection completely
      // User can send a new request later

      await connection.deleteOne();


      res.status(200).json({
        success: true,
        message:
          "User unblocked successfully",
      });


    } catch (error) {

      console.error(
        "Unblock User Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  };


// ==========================================
// GET BLOCKED USERS
// GET /api/connections/blocked
// ==========================================

exports.getBlockedUsers =
  async (
    req,
    res
  ) => {

    try {

      const userId =
        req.user.id;


      const connections =
        await Connection.find({
          status:
            "blocked",

          blockedBy:
            userId,
        })

          .populate(
            "sender",
            "_id name email profileImage role bio"
          )

          .populate(
            "receiver",
            "_id name email profileImage role bio"
          );


      const users =
        connections.map(
          connection => {

            const sender =
              connection.sender;

            const receiver =
              connection.receiver;


            const blockedUser =
              sender._id.toString() ===
              userId
                ? receiver
                : sender;


            return {
              connectionId:
                connection._id,

              user:
                blockedUser,

              blockedAt:
                connection.updatedAt,
            };

          }
        );


      res.status(200).json({
        success: true,
        users,
      });


    } catch (error) {

      console.error(
        "Get Blocked Users Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  };

