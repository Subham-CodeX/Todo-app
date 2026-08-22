const crypto = require("crypto");

// ============================================
// GENERATE OTP
// ============================================

const generateOTP = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

// ============================================
// OTP EXPIRY
// ============================================

const getOTPExpiry = () => {
  return new Date(
    Date.now() + 10 * 60 * 1000
  );
};

// ============================================
// HASH OTP
// ============================================

const hashOTP = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

// ============================================
// COMPARE OTP
// ============================================

const compareOTP = (
  otp,
  hashedOTP
) => {
  const hashed =
    hashOTP(otp);

  return hashed === hashedOTP;
};

module.exports = {
  generateOTP,
  getOTPExpiry,
  hashOTP,
  compareOTP,
};