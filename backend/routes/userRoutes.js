const express =
  require(
    "express"
  );


const router =
  express.Router();


const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  searchUsers,
} =
  require(
    "../controllers/userController"
  );


const profileUpload =
  require(
    "../middleware/profileUpload"
  );


const {
  protect,
} =
  require(
    "../middleware/authMiddleware"
  );


// ==========================================
// EVERY PROFILE ENDPOINT REQUIRES LOGIN
// ==========================================

router.use(
  protect
);


// ==========================================
// SEARCH USERS
// GET /api/users/search?q=subham
// ==========================================

router.get(
  "/search",
  searchUsers
);


// ==========================================
// GET PROFILE
// GET /api/users/profile
// ==========================================

router.get(
  "/profile",
  getProfile
);


// ==========================================
// UPDATE PROFILE
// PUT /api/users/profile
// ==========================================

router.put(
  "/profile",
  updateProfile
);


// ==========================================
// PROFILE IMAGE
// POST /api/users/profile/image
// ==========================================

router.post(
  "/profile/image",
  profileUpload.single(
    "profileImage"
  ),
  uploadProfileImage
);


// ==========================================
// CHANGE PASSWORD
// PUT /api/users/change-password
// ==========================================

router.put(
  "/change-password",
  changePassword
);


module.exports =
  router;