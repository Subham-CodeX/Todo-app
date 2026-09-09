const express =
  require(
    "express"
  );


const router =
  express.Router();


const {
  getMessages,
} =
  require(
    "../controllers/messageController"
  );


const {
  protect,
} =
  require(
    "../middleware/authMiddleware"
  );


// ==========================================
// GET CHAT HISTORY
// ==========================================

router.get(

  "/:userId",

  protect,

  getMessages

);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports =
  router;