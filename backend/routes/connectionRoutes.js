const express =
  require("express");

const router =
  express.Router();

const protect =
  require(
    "../middleware/authMiddleware"
  );

const {
  sendRequest,
  getIncomingRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  getConnectedUsers,
  blockUser,
  unblockUser,
  getBlockedUsers,
} =
  require(
    "../controllers/connectionController"
  );


// ==========================================
// ALL CONNECTION ROUTES REQUIRE LOGIN
// ==========================================

router.use(
  protect
);


// ==========================================
// GET CONNECTED USERS
// GET /api/connections
// ==========================================

router.get(
  "/",
  getConnectedUsers
);


// ==========================================
// REQUESTS
// ==========================================

router.post(
  "/request/:userId",
  sendRequest
);

router.get(
  "/requests/incoming",
  getIncomingRequests
);

router.get(
  "/requests/sent",
  getSentRequests
);


// ==========================================
// ACCEPT / REJECT
// ==========================================

router.put(
  "/:id/accept",
  acceptRequest
);

router.put(
  "/:id/reject",
  rejectRequest
);


// ==========================================
// BLOCK USERS
// ==========================================

router.get(
  "/blocked",
  getBlockedUsers
);

router.put(
  "/block/:userId",
  blockUser
);

router.delete(
  "/block/:userId",
  unblockUser
);


module.exports =
  router;