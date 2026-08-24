const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    emailVerified: {
    type: Boolean,
    default: false,
    },

    emailVerificationOTP: {
      type: String,
      default: "",
      select: false,
    },

    emailVerificationOTPExpires: {
      type: Date,
      default: null,
      select: false,
    },

    emailVerificationOTPLastSentAt: {
      type: Date,
      default: null,
      select: false,
    },

    emailVerificationOTPResendCount: {
      type: Number,
      default: 0,
      select: false,
    },

    emailVerificationOTPResendWindowStart: {
      type: Date,
      default: null,
      select: false,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    passwordResetOTP: {
      type: String,
      default: "",
      select: false,
    },

    passwordResetOTPExpires: {
      type: Date,
      default: null,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },

    passwordResetOTPLastSentAt: {
      type: Date,
      default: null,
      select: false,
    },

    passwordResetOTPAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    passwordResetOTPBlockedUntil: {
      type: Date,
      default: null,
      select: false,
    },

    passwordResetOTPResendCount: {
      type: Number,
      default: 0,
      select: false,
    },

    passwordResetOTPResendWindowStart: {
      type: Date,
      default: null,
      select: false,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    dateOfBirth: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: [
        "Student",
        "Businessman",
        "Developer",
        "Teacher",
        "Freelancer",
        "Designer",
        "Doctor",
        "Engineer",
        "Entrepreneur",
        "Other",
      ],
      default: "Other",
    },

    hobbies: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      city: {
        type: String,
        default: "",
        trim: true,
      },

      district: {
        type: String,
        default: "",
        trim: true,
      },

      state: {
        type: String,
        default: "",
        trim: true,
      },

      zipCode: {
        type: String,
        default: "",
        trim: true,
      },

      country: {
        type: String,
        default: "",
        trim: true,
      },
    },

    profileImage: {
      type: String,
      default: "",
    },

    profileImagePublicId: {
      type: String,
      default: "",
    },

    profileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);