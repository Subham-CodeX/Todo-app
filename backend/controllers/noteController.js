const Note = require("../models/Note");

// =========================
// GET ALL NOTES
// =========================

const getNotes = async (req, res) => {

  try {

    const notes = await Note.find()
      .sort({
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

// =========================
// CREATE NOTE
// =========================

const createNote = async (req, res) => {

  try {

    const note = await Note.create(
      req.body
    );

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

// =========================
// UPDATE NOTE
// =========================

const updateNote = async (req, res) => {

  try {

    const note =
      await Note.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!note) {

      return res.status(404).json({
        message: "Note not found",
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

// =========================
// DELETE NOTE
// =========================

const deleteNote = async (req, res) => {

  try {

    const note =
      await Note.findByIdAndDelete(
        req.params.id
      );

    if (!note) {

      return res.status(404).json({
        message: "Note not found",
      });

    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
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


// =========================
// EXPORT
// =========================

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};