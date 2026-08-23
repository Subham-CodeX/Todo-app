const crypto = require("crypto");

// ==========================================
// GENERATE RESET TOKEN
// ==========================================

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// ==========================================
// HASH RESET TOKEN
// ==========================================

const hashResetToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ==========================================
// TOKEN EXPIRY
// ==========================================

const getResetTokenExpiry = () => {
  // 10 minutes
  return new Date(
    Date.now() + 10 * 60 * 1000
  );
};

module.exports = {
  generateResetToken,
  hashResetToken,
  getResetTokenExpiry,
};