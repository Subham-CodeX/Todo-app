const express = require("express");

const router =
  express.Router();

const {
  register,
  verifyEmail,
  resendEmailOTP,
  login,
  getMe,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
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

// ============================================
// FORGOT PASSWORD
// ============================================

router.post(
  "/forgot-password",
  forgotPassword
);

// ============================================
// VERIFY RESET OTP
// ============================================

router.post(
  "/verify-reset-otp",
  verifyResetOTP
);

// ============================================
// RESET PASSWORD
// ============================================

router.post(
  "/reset-password",
  resetPassword
);

module.exports = router;