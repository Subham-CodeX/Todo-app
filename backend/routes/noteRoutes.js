const express =
  require(
    "express"
  );


const router =
  express.Router();


const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} =
  require(
    "../controllers/noteController"
  );


const {
  protect,
} =
  require(
    "../middleware/authMiddleware"
  );


// ==========================================
// PROTECT ALL NOTE ROUTES
// ==========================================

router.use(
  protect
);


// ==========================================
// GET NOTES
// ==========================================

router.get(
  "/",
  getNotes
);


// ==========================================
// CREATE NOTE
// ==========================================

router.post(
  "/",
  createNote
);


// ==========================================
// UPDATE NOTE
// ==========================================

router.put(
  "/:id",
  updateNote
);


// ==========================================
// DELETE NOTE
// ==========================================

router.delete(
  "/:id",
  deleteNote
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports =
  router;