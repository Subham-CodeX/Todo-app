const Note =
  require("../models/Note");

// ==============================
// ALLOWED NOTE DATA
// ==============================

const getNoteData = (body) => ({
  title: body.title,
  content: body.content,
  color: body.color,
  isPinned: body.isPinned,
  archived: body.archived,
  favorite: body.favorite,
});

// ==============================
// GET USER NOTES
// ==============================

const getNotes = async (
  req,
  res
) => {
  try {

    const notes =
      await Note.find({
        userId: req.user.id,
      }).sort({
        isPinned: -1,
        updatedAt: -1,
      });

    res.status(200).json(notes);

  } catch (err) {

    console.error(
      "Get Notes Error:",
      err
    );

    res.status(500).json({
      message: err.message,
    });

  }
};

// ==============================
// CREATE NOTE
// ==============================

const createNote = async (
  req,
  res
) => {
  try {

    const note =
      await Note.create({
        ...getNoteData(req.body),

        userId: req.user.id,
      });

    res.status(201).json(note);

  } catch (err) {

    console.error(
      "Create Note Error:",
      err
    );

    res.status(500).json({
      message: err.message,
    });

  }
};

// ==============================
// UPDATE NOTE
// ==============================

const updateNote = async (
  req,
  res
) => {
  try {

    const note =
      await Note.findOneAndUpdate(
        {
          _id: req.params.id,

          userId: req.user.id,
        },

        {
          $set:
            getNoteData(
              req.body
            ),
        },

        {
          new: true,

          runValidators: true,
        }
      );

    if (!note) {
      return res.status(404).json({
        message:
          "Note not found",
      });
    }

    res.status(200).json(note);

  } catch (err) {

    console.error(
      "Update Note Error:",
      err
    );

    res.status(500).json({
      message: err.message,
    });

  }
};

// ==============================
// DELETE NOTE
// ==============================

const deleteNote = async (
  req,
  res
) => {
  try {

    const note =
      await Note.findOneAndDelete({
        _id: req.params.id,

        userId: req.user.id,
      });

    if (!note) {
      return res.status(404).json({
        message:
          "Note not found",
      });
    }

    res.status(200).json({
      success: true,

      message:
        "Note deleted successfully",
    });

  } catch (err) {

    console.error(
      "Delete Note Error:",
      err
    );

    res.status(500).json({
      message: err.message,
    });

  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};