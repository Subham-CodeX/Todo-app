const express = require("express");

const router =
  express.Router();

const {
  register,
  verifyEmail,
  resendEmailOTP,
  login,
  getMe,
} = require(
  "../controllers/authController"
);

const protect =
  require(
    "../middleware/authMiddleware"
  );

// ============================================
// REGISTER
// ============================================

router.post(
  "/register",
  register
);

// ============================================
// VERIFY EMAIL
// ============================================

router.post(
  "/verify-email",
  verifyEmail
);

// ============================================
// RESEND EMAIL OTP
// ============================================

router.post(
  "/resend-email-otp",
  resendEmailOTP
);

// ============================================
// LOGIN
// ============================================

router.post(
  "/login",
  login
);

// ============================================
// CURRENT USER
// ============================================

router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;