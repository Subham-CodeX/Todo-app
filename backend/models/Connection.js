const mongoose = require("mongoose");

const connectionSchema =
  new mongoose.Schema(
    {
      // User who sends the connection request
      sender: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // User who receives the connection request
      receiver: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      status: {
        type: String,

        enum: [
          "pending",
          "accepted",
          "rejected",
          "blocked",
        ],

        default: "pending",
      },

      // Who blocked the connection?
      blockedBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

// ==========================================
// Prevent duplicate connection records
// ==========================================

connectionSchema.index(
  {
    sender: 1,
    receiver: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.model(
    "Connection",
    connectionSchema
  );