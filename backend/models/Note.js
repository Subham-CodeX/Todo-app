const mongoose = require("mongoose");

const noteSchema =
  new mongoose.Schema(
    {
      // ==========================
      // OWNER
      // ==========================

      userId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      title: {
        type: String,

        default: "",

        trim: true,
      },

      content: {
        type: String,

        required: true,

        trim: true,
      },

      color: {
        type: String,

        default: "#FFF9C4",
      },

      isPinned: {
        type: Boolean,

        default: false,
      },

      archived: {
        type: Boolean,

        default: false,
      },

      favorite: {
        type: Boolean,

        default: false,
      },
    },

    {
      timestamps: true,
    }
  );

const Note =
  mongoose.model(
    "Note",
    noteSchema
  );

module.exports = Note;