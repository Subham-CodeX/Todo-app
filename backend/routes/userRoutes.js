const express = require("express");

const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
} = require("../controllers/userController");

const profileUpload =
  require("../middleware/profileUpload");

const protect =
  require("../middleware/authMiddleware");

// Every profile endpoint requires login
router.use(protect);

// GET /api/users/profile
router.get(
  "/profile",
  getProfile
);

// PUT /api/users/profile
router.put(
  "/profile",
  updateProfile
);

router.post(
  "/profile/image",
  profileUpload.single("profileImage"),
  uploadProfileImage
);

// PUT /api/users/change-password
router.put(
  "/change-password",
  changePassword
);

module.exports = router;