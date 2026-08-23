const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const {
  sendEmail,
} = require("../services/brevoService");

const {
  generateOTP,
  getOTPExpiry,
  hashOTP,
  compareOTP,
} = require("../utils/otp");

const {
  generateResetToken,
  hashResetToken,
  getResetTokenExpiry,
} = require("../utils/resetToken");

// ============================================
// CREATE JWT
// ============================================

const createToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "30d",
    }
  );
};

// ============================================
// PASSWORD RESET SECURITY SETTINGS
// ============================================

const PASSWORD_RESET_OTP_COOLDOWN = 60 * 1000;
// 60 seconds

const PASSWORD_RESET_MAX_ATTEMPTS = 5;
// 5 wrong OTP attempts

const PASSWORD_RESET_BLOCK_TIME = 15 * 60 * 1000;
// 15 minutes

const PASSWORD_RESET_MAX_RESENDS = 5;
// Maximum 5 OTP sends

const PASSWORD_RESET_RESEND_WINDOW = 60 * 60 * 1000;
// 1 hour

// ============================================
// REGISTER
// ============================================

exports.register = async (
  req,
  res
) => {
  try {

    const {
      name,
      email,
      password,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // ==============================
    // CHECK EXISTING USER
    // ==============================

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {

      // ==================================
      // EXISTING BUT NOT VERIFIED
      // ==================================

      if (
        !existingUser.emailVerified
      ) {

        return res.status(409).json({
          success: false,
          message:
            "This email is already registered but not verified. Please verify your email.",
          needsVerification: true,
          email: normalizedEmail,
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    const otp =
      generateOTP();

    const hashedOTP =
      hashOTP(otp);

    const otpExpiry =
      getOTPExpiry();

    const user =
      await User.create({
        name: name.trim(),

        email:
          normalizedEmail,

        password:
          hashedPassword,

        emailVerified:
          false,

        emailVerificationOTP:
          hashedOTP,

        emailVerificationOTPExpires:
          otpExpiry,

        profileComplete:
          false,
      });

    // ==============================
    // SEND OTP EMAIL
    // ==============================

    await sendEmail({
      to: normalizedEmail,

      name: user.name,

      subject:
        "Verify your TaskFlow email",

      textContent:
        `Hello ${user.name},

Your TaskFlow verification code is:

${otp}

This code will expire in 10 minutes.

If you did not create a TaskFlow account, please ignore this email.

TaskFlow`,

      htmlContent: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          background: #f8f8f8;
        ">

          <div style="
            background: #ffffff;
            padding: 30px;
            border-radius: 16px;
          ">

            <h1 style="
              margin-top: 0;
              color: #111111;
            ">
              Welcome to TaskFlow 🚀
            </h1>

            <p>
              Hello ${user.name},
            </p>

            <p>
              Thanks for creating your TaskFlow account.
              Please verify your email address using the
              verification code below.
            </p>

            <div style="
              margin: 30px 0;
              text-align: center;
            ">

              <div style="
                display: inline-block;
                padding: 18px 30px;
                background: #111111;
                color: #ffffff;
                border-radius: 12px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
              ">
                ${otp}
              </div>

            </div>

            <p>
              This verification code will expire in
              <strong>10 minutes</strong>.
            </p>

            <p style="
              color: #777777;
              font-size: 13px;
            ">
              If you did not create a TaskFlow account,
              you can safely ignore this email.
            </p>

            <hr />

            <p style="
              color: #999999;
              font-size: 12px;
            ">
              TaskFlow — Stay organized. Stay focused.
            </p>

          </div>

        </div>
      `,
    });

    // ==============================
    // DO NOT CREATE JWT HERE
    // ==============================

    res.status(201).json({
      success: true,

      message:
        "Registration successful. Please check your email for the verification OTP.",

      requiresVerification:
        true,

      email:
        normalizedEmail,
    });

  } catch (error) {

    console.error(
      "Register Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Registration failed",
    });
  }
};

// ============================================
// VERIFY EMAIL OTP
// ============================================

exports.verifyEmail = async (
  req,
  res
) => {
  try {

    const {
      email,
      otp,
    } = req.body;

    if (
      !email ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select(
        "+emailVerificationOTP +emailVerificationOTPExpires"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Account not found",
      });
    }

    if (user.emailVerified) {

      return res.status(400).json({
        success: false,
        message:
          "Email is already verified",
      });
    }

    // ==============================
    // OTP EXISTS?
    // ==============================

    if (
      !user.emailVerificationOTP ||
      !user.emailVerificationOTPExpires
    ) {

      return res.status(400).json({
        success: false,
        message:
          "No verification OTP found. Please request a new OTP.",
      });
    }

    // ==============================
    // OTP EXPIRED?
    // ==============================

    if (
      user.emailVerificationOTPExpires <
      new Date()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // ==============================
    // COMPARE OTP
    // ==============================

    const validOTP =
      compareOTP(
        otp.trim(),
        user.emailVerificationOTP
      );

    if (!validOTP) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid OTP",
      });
    }

    // ==============================
    // VERIFY USER
    // ==============================

    user.emailVerified =
      true;

    user.emailVerificationOTP =
      "";

    user.emailVerificationOTPExpires =
      null;

    await user.save();

    const token =
      createToken(user._id);

    res.status(200).json({
      success: true,

      message:
        "Email verified successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified:
          user.emailVerified,
        profileComplete:
          user.profileComplete,
      },
    });

  } catch (error) {

    console.error(
      "Verify Email Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Email verification failed",
    });
  }
};

// ============================================
// RESEND EMAIL OTP
// ============================================

exports.resendEmailOTP = async (
  req,
  res
) => {
  try {

    const {
      email,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Account not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email is already verified",
      });
    }

    // ==============================
    // NEW OTP
    // ==============================

    const otp =
      generateOTP();

    const hashedOTP =
      hashOTP(otp);

    user.emailVerificationOTP =
      hashedOTP;

    user.emailVerificationOTPExpires =
      getOTPExpiry();

    await user.save();

    // ==============================
    // SEND EMAIL
    // ==============================

    await sendEmail({
      to: user.email,

      name: user.name,

      subject:
        "Your new TaskFlow verification code",

      textContent:
        `Hello ${user.name},

Your new TaskFlow verification code is:

${otp}

This code will expire in 10 minutes.

TaskFlow`,

      htmlContent: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
        ">

          <h2>
            TaskFlow Email Verification
          </h2>

          <p>
            Hello ${user.name},
          </p>

          <p>
            Your new verification code is:
          </p>

          <div style="
            margin: 25px 0;
            padding: 18px;
            text-align: center;
            font-size: 30px;
            font-weight: bold;
            letter-spacing: 8px;
            background: #111111;
            color: #ffffff;
            border-radius: 10px;
          ">
            ${otp}
          </div>

          <p>
            This code expires in
            <strong>10 minutes</strong>.
          </p>

        </div>
      `,
    });

    res.status(200).json({
      success: true,

      message:
        "A new verification OTP has been sent to your email.",
    });

  } catch (error) {

    console.error(
      "Resend OTP Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to resend OTP",
    });
  }
};

// ============================================
// LOGIN
// ============================================

exports.login = async (
  req,
  res
) => {
  try {

    const {
      email,
      password,
    } = req.body;

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // ==============================
    // FIND USER
    // ==============================

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ==============================
    // CHECK PASSWORD
    // ==============================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ==============================
    // CHECK EMAIL VERIFICATION
    // ==============================

    if (!user.emailVerified) {

      return res.status(403).json({
        success: false,

        message:
          "Please verify your email before logging in.",

        needsVerification:
          true,

        email:
          user.email,
      });
    }

    // ==============================
    // CREATE JWT
    // ==============================

    const token =
      createToken(user._id);

    // ==============================
    // RESPONSE
    // ==============================

    res.status(200).json({
      success: true,

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified:
          user.emailVerified,
        profileComplete:
          user.profileComplete,
      },
    });

  } catch (error) {

    console.error(
      "Login Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Login failed",
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================

exports.getMe = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(
        req.user.id
      ).select(
        "-password"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    console.error(
      "Get Me Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

// ============================================
// FORGOT PASSWORD
// ============================================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // ==============================
    // FIND USER
    // ==============================
    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+passwordResetOTPLastSentAt " +
      "+passwordResetOTPAttempts " +
      "+passwordResetOTPBlockedUntil " +
      "+passwordResetOTPResendCount " +
      "+passwordResetOTPResendWindowStart"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // ============================================
    // CHECK OTP VERIFICATION BLOCK
    // ============================================

    if (
      user.passwordResetOTPBlockedUntil &&
      user.passwordResetOTPBlockedUntil > new Date()
    ) {

      const remainingMs =
        user.passwordResetOTPBlockedUntil.getTime() -
        Date.now();

      const remainingMinutes =
        Math.ceil(
          remainingMs / 60000
        );

      return res.status(429).json({
        success: false,
        message:
          `Too many incorrect OTP attempts. Please try again in ${remainingMinutes} minute(s).`,
        retryAfter: Math.ceil(
          remainingMs / 1000
        ),
      });
    }

    // ============================================
    // OTP SEND COOLDOWN
    // ============================================

    if (user.passwordResetOTPLastSentAt) {

      const elapsed =
        Date.now() -
        user.passwordResetOTPLastSentAt.getTime();

      if (
        elapsed <
        PASSWORD_RESET_OTP_COOLDOWN
      ) {

        const remainingSeconds =
          Math.ceil(
            (
              PASSWORD_RESET_OTP_COOLDOWN -
              elapsed
            ) / 1000
          );

        return res.status(429).json({
          success: false,

          message:
            `Please wait ${remainingSeconds} seconds before requesting another OTP.`,

          retryAfter:
            remainingSeconds,
        });
      }
    }

    // ============================================
    // RESEND WINDOW
    // ============================================

    const now = new Date();

    if (
      !user.passwordResetOTPResendWindowStart ||
      (
        now.getTime() -
        user.passwordResetOTPResendWindowStart.getTime()
      ) >
      PASSWORD_RESET_RESEND_WINDOW
    ) {

      // Start a new one-hour window

      user.passwordResetOTPResendWindowStart =
        now;

      user.passwordResetOTPResendCount = 0;
    }

    // ============================================
    // MAX OTP SEND LIMIT
    // ============================================

    if (
      user.passwordResetOTPResendCount >=
      PASSWORD_RESET_MAX_RESENDS
    ) {

      const windowEnd =
        user.passwordResetOTPResendWindowStart.getTime() +
        PASSWORD_RESET_RESEND_WINDOW;

      const remainingMs =
        windowEnd - Date.now();

      const remainingMinutes =
        Math.ceil(
          remainingMs / 60000
        );

      return res.status(429).json({
        success: false,

        message:
          `Too many OTP requests. Please try again in ${remainingMinutes} minute(s).`,

        retryAfter:
          Math.ceil(
            remainingMs / 1000
          ),
      });
    }

    // ==============================
    // EMAIL MUST BE VERIFIED
    // ==============================

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before resetting your password.",
        needsVerification: true,
      });
    }

    // ==============================
    // GENERATE OTP
    // ==============================

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    user.passwordResetOTP =
      hashedOTP;

    user.passwordResetOTPExpires =
      getOTPExpiry();

    user.passwordResetOTPLastSentAt =
      new Date();

    user.passwordResetOTPResendCount += 1;
    user.passwordResetOTPAttempts = 0;
    user.passwordResetOTPBlockedUntil = null;

    await user.save();

    // ==============================
    // SEND OTP EMAIL
    // ==============================

    await sendEmail({
      to: user.email,

      name: user.name,

      subject:
        "TaskFlow Password Reset OTP",

      textContent:
        `Hello ${user.name},

We received a request to reset your TaskFlow password.

Your password reset code is:

${otp}

This code will expire in 10 minutes.

If you did not request a password reset, please ignore this email.

TaskFlow`,

      htmlContent: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          background: #f8f8f8;
        ">

          <div style="
            background: #ffffff;
            padding: 30px;
            border-radius: 16px;
          ">

            <h1 style="
              margin-top: 0;
              color: #111111;
            ">
              Reset your TaskFlow password 🔐
            </h1>

            <p>
              Hello ${user.name},
            </p>

            <p>
              We received a request to reset your
              TaskFlow account password.
            </p>

            <p>
              Your password reset code is:
            </p>

            <div style="
              margin: 30px 0;
              text-align: center;
            ">

              <div style="
                display: inline-block;
                padding: 18px 30px;
                background: #111111;
                color: #ffffff;
                border-radius: 12px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
              ">
                ${otp}
              </div>

            </div>

            <p>
              This code will expire in
              <strong>10 minutes</strong>.
            </p>

            <p style="
              color: #777777;
              font-size: 13px;
            ">
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <hr />

            <p style="
              color: #999999;
              font-size: 12px;
            ">
              TaskFlow — Stay organized. Stay focused.
            </p>

          </div>

        </div>
      `,
    });

    // ==============================
    // RESPONSE
    // ==============================

    res.status(200).json({
      success: true,

      message:
        "Password reset OTP has been sent to your email.",

      email: normalizedEmail,
    });

  } catch (error) {

    console.error(
      "Forgot Password Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to send password reset OTP",
    });
  }
};

// ============================================
// VERIFY PASSWORD RESET OTP
// ============================================

exports.verifyResetOTP = async (
  req,
  res
) => {
  try {

    const {
      email,
      otp,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // ==============================
    // FIND USER
    // ==============================

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select(
        "+passwordResetOTP " +
        "+passwordResetOTPExpires " +
        "+passwordResetOTPAttempts " +
        "+passwordResetOTPBlockedUntil"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Account not found",
      });
    }

    // ============================================
    // CHECK OTP BLOCK
    // ============================================

    if (
      user.passwordResetOTPBlockedUntil &&
      user.passwordResetOTPBlockedUntil > new Date()
    ) {

      const remainingMs =
        user.passwordResetOTPBlockedUntil.getTime() -
        Date.now();

      const remainingMinutes =
        Math.ceil(
          remainingMs / 60000
        );

      return res.status(429).json({
        success: false,

        message:
          `Too many incorrect OTP attempts. Please try again in ${remainingMinutes} minute(s).`,

        retryAfter:
          Math.ceil(
            remainingMs / 1000
          ),
      });
    }

    // ==============================
    // CHECK OTP EXISTS
    // ==============================

    if (
      !user.passwordResetOTP ||
      !user.passwordResetOTPExpires
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No password reset OTP found. Please request a new OTP.",
      });
    }

    // ==============================
    // CHECK EXPIRY
    // ==============================

    if (
      user.passwordResetOTPExpires <
      new Date()
    ) {

      // Clear expired OTP

      user.passwordResetOTP = "";

      user.passwordResetOTPExpires = null;

      await user.save();

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // ==============================
    // VERIFY OTP
    // ==============================

    const validOTP =
      compareOTP(
        otp.trim(),
        user.passwordResetOTP
      );

    if (!validOTP) {

      user.passwordResetOTPAttempts += 1;

      // ========================================
      // MAX ATTEMPTS REACHED
      // ========================================

      if (
        user.passwordResetOTPAttempts >=
        PASSWORD_RESET_MAX_ATTEMPTS
      ) {

        user.passwordResetOTPBlockedUntil =
          new Date(
            Date.now() +
            PASSWORD_RESET_BLOCK_TIME
          );

        // Invalidate OTP

        user.passwordResetOTP = "";

        user.passwordResetOTPExpires = null;

        await user.save();

        return res.status(429).json({
          success: false,

          message:
            "Too many incorrect OTP attempts. Password reset has been temporarily blocked for 15 minutes.",

          retryAfter:
            PASSWORD_RESET_BLOCK_TIME / 1000,
        });
      }

      await user.save();

      const remainingAttempts =
        PASSWORD_RESET_MAX_ATTEMPTS -
        user.passwordResetOTPAttempts;

      return res.status(400).json({
        success: false,

        message:
          `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
      });
    }

    // ==========================================
    // OTP IS VALID
    // ==========================================

    const resetToken =
      generateResetToken();

    const hashedResetToken =
      hashResetToken(resetToken);

    // ==========================================
    // SAVE HASHED RESET TOKEN
    // ==========================================

    user.passwordResetToken =
      hashedResetToken;

    user.passwordResetTokenExpires =
      getResetTokenExpiry();

    // ==========================================
    // INVALIDATE OTP IMMEDIATELY
    // ==========================================

    user.passwordResetOTP = "";
    user.passwordResetOTPExpires = null;

    // ==========================================
    // RESET OTP SECURITY STATE
    // ==========================================

    user.passwordResetOTPAttempts = 0;
    user.passwordResetOTPBlockedUntil = null;

    await user.save();

    // ============================================
    // RESEND PASSWORD RESET OTP
    // ============================================

    exports.resendResetOTP = async (
      req,
      res
    ) => {
      try {

        const {
          email,
        } = req.body;

        // ==============================
        // VALIDATION
        // ==============================

        if (!email) {
          return res.status(400).json({
            success: false,
            message:
              "Email is required",
          });
        }

        const normalizedEmail =
          email.toLowerCase().trim();

        // ==============================
        // FIND USER
        // ==============================

        const user =
          await User.findOne({
            email: normalizedEmail,
          }).select(
            "+passwordResetOTPLastSentAt " +
            "+passwordResetOTPAttempts " +
            "+passwordResetOTPBlockedUntil " +
            "+passwordResetOTPResendCount " +
            "+passwordResetOTPResendWindowStart"
          );

        if (!user) {
          return res.status(404).json({
            success: false,
            message:
              "No account found with this email",
          });
        }

        // ==============================
        // EMAIL VERIFIED?
        // ==============================

        if (!user.emailVerified) {
          return res.status(403).json({
            success: false,
            message:
              "Please verify your email first.",
          });
        }

        // ==============================
        // CHECK BLOCK
        // ==============================

        if (
          user.passwordResetOTPBlockedUntil &&
          user.passwordResetOTPBlockedUntil > new Date()
        ) {

          const remainingMs =
            user.passwordResetOTPBlockedUntil.getTime() -
            Date.now();

          const remainingMinutes =
            Math.ceil(
              remainingMs / 60000
            );

          return res.status(429).json({
            success: false,

            message:
              `Too many incorrect OTP attempts. Please try again in ${remainingMinutes} minute(s).`,

            retryAfter:
              Math.ceil(
                remainingMs / 1000
              ),
          });
        }

        // ==============================
        // COOLDOWN
        // ==============================

        if (
          user.passwordResetOTPLastSentAt
        ) {

          const elapsed =
            Date.now() -
            user.passwordResetOTPLastSentAt.getTime();

          if (
            elapsed <
            PASSWORD_RESET_OTP_COOLDOWN
          ) {

            const remainingSeconds =
              Math.ceil(
                (
                  PASSWORD_RESET_OTP_COOLDOWN -
                  elapsed
                ) / 1000
              );

            return res.status(429).json({
              success: false,

              message:
                `Please wait ${remainingSeconds} seconds before requesting another OTP.`,

              retryAfter:
                remainingSeconds,
            });
          }
        }

        // ==============================
        // RESEND WINDOW
        // ==============================

        const now = new Date();

        if (
          !user.passwordResetOTPResendWindowStart ||
          (
            now.getTime() -
            user.passwordResetOTPResendWindowStart.getTime()
          ) >
          PASSWORD_RESET_RESEND_WINDOW
        ) {

          user.passwordResetOTPResendWindowStart =
            now;

          user.passwordResetOTPResendCount = 0;
        }

        // ==============================
        // MAX RESENDS
        // ==============================

        if (
          user.passwordResetOTPResendCount >=
          PASSWORD_RESET_MAX_RESENDS
        ) {

          const windowEnd =
            user.passwordResetOTPResendWindowStart.getTime() +
            PASSWORD_RESET_RESEND_WINDOW;

          const remainingMs =
            windowEnd - Date.now();

          const remainingMinutes =
            Math.ceil(
              remainingMs / 60000
            );

          return res.status(429).json({
            success: false,

            message:
              `Too many OTP requests. Please try again in ${remainingMinutes} minute(s).`,

            retryAfter:
              Math.ceil(
                remainingMs / 1000
              ),
          });
        }

        // ==============================
        // GENERATE NEW OTP
        // ==============================

        const otp =
          generateOTP();

        const hashedOTP =
          hashOTP(otp);

        user.passwordResetOTP =
          hashedOTP;

        user.passwordResetOTPExpires =
          getOTPExpiry();

        user.passwordResetOTPLastSentAt =
          new Date();

        user.passwordResetOTPResendCount += 1;

        user.passwordResetOTPAttempts = 0;

        user.passwordResetOTPBlockedUntil =
          null;

        // A new OTP invalidates old reset token

        user.passwordResetToken = "";

        user.passwordResetTokenExpires =
          null;

        await user.save();

        // ==============================
        // SEND EMAIL
        // ==============================

        await sendEmail({
          to: user.email,

          name: user.name,

          subject:
            "Your new TaskFlow Password Reset OTP",

          textContent:
    `Hello ${user.name},

    Your new TaskFlow password reset code is:

    ${otp}

    This code will expire in 10 minutes.

    If you did not request a password reset, please ignore this email.

    TaskFlow`,

          htmlContent: `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 30px;
              background: #f8f8f8;
            ">

              <div style="
                background: #ffffff;
                padding: 30px;
                border-radius: 16px;
              ">

                <h1 style="
                  margin-top: 0;
                  color: #111111;
                ">
                  New Password Reset Code 🔐
                </h1>

                <p>
                  Hello ${user.name},
                </p>

                <p>
                  Your new TaskFlow password reset code is:
                </p>

                <div style="
                  margin: 30px 0;
                  text-align: center;
                ">

                  <div style="
                    display: inline-block;
                    padding: 18px 30px;
                    background: #111111;
                    color: #ffffff;
                    border-radius: 12px;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                  ">
                    ${otp}
                  </div>

                </div>

                <p>
                  This code will expire in
                  <strong>10 minutes</strong>.
                </p>

                <p style="
                  color: #777777;
                  font-size: 13px;
                ">
                  If you did not request a password reset,
                  you can safely ignore this email.
                </p>

                <hr />

                <p style="
                  color: #999999;
                  font-size: 12px;
                ">
                  TaskFlow — Stay organized. Stay focused.
                </p>

              </div>

            </div>
          `,
        });

        // ==============================
        // RESPONSE
        // ==============================

        res.status(200).json({
          success: true,

          message:
            "A new password reset OTP has been sent to your email.",

          retryAfter:
            PASSWORD_RESET_OTP_COOLDOWN,
        });

      } catch (error) {

        console.error(
          "Resend Reset OTP Error:",
          error
        );

        res.status(500).json({
          success: false,

          message:
            error.message ||
            "Failed to resend password reset OTP",
        });
      }
    };

    // ==========================================
    // RETURN TEMPORARY RESET TOKEN
    // ==========================================

    res.status(200).json({
      success: true,

      message:
        "OTP verified successfully.",

      resetToken,
    });

  } catch (error) {

    console.error(
      "Verify Reset OTP Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to verify reset OTP",
    });
  }
};

// ============================================
// RESET PASSWORD USING TEMPORARY RESET TOKEN
// ============================================

exports.resetPassword = async (
  req,
  res
) => {
  try {

    const {
      email,
      resetToken,
      newPassword,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (
      !email ||
      !resetToken ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // ==============================
    // HASH TOKEN FROM CLIENT
    // ==============================

    const hashedResetToken =
      hashResetToken(
        resetToken
      );

    // ==============================
    // FIND USER
    // ==============================

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select(
        "+password +passwordResetToken +passwordResetTokenExpires"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Account not found",
      });
    }

    // ==============================
    // CHECK TOKEN EXISTS
    // ==============================

    if (
      !user.passwordResetToken ||
      !user.passwordResetTokenExpires
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Password reset session is invalid. Please request a new OTP.",
      });
    }

    // ==============================
    // CHECK TOKEN EXPIRY
    // ==============================

    if (
      user.passwordResetTokenExpires <
      new Date()
    ) {

      // Invalidate expired token

      user.passwordResetToken = "";

      user.passwordResetTokenExpires = null;

      await user.save();

      return res.status(400).json({
        success: false,
        message:
          "Password reset session has expired. Please request a new OTP.",
      });
    }

    // ==============================
    // VERIFY RESET TOKEN
    // ==============================

    if (
      hashedResetToken !==
      user.passwordResetToken
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Invalid password reset token.",
      });
    }

    // ==============================
    // CHECK OLD PASSWORD
    // ==============================

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from your old password",
      });
    }

    // ==============================
    // HASH NEW PASSWORD
    // ==============================

    user.password =
      await bcrypt.hash(
        newPassword,
        12
      );

    // ==========================================
    // INVALIDATE RESET TOKEN
    // ==========================================

    user.passwordResetToken = "";

    user.passwordResetTokenExpires = null;

    // ==========================================
    // SAVE
    // ==========================================

    await user.save();

    // ==============================
    // SUCCESS
    // ==============================

    res.status(200).json({
      success: true,

      message:
        "Password reset successfully. You can now login.",
    });

  } catch (error) {

    console.error(
      "Reset Password Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to reset password",
    });
  }
};