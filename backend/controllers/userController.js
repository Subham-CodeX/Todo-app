const bcrypt = require("bcryptjs");
const User = require("../models/User");
const cloudinary =
  require("../config/cloudinary");
// ==========================================
// GET MY PROFILE
// ==========================================

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Get Profile Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      dateOfBirth,
      role,
      hobbies,
      bio,
      address,
      profileImage,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==============================
    // BASIC PROFILE
    // ==============================

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth;
    }

    if (role !== undefined) {
      user.role = role;
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    // ==============================
    // HOBBIES
    // ==============================

    if (hobbies !== undefined) {
      if (Array.isArray(hobbies)) {
        user.hobbies = hobbies
          .map((hobby) => String(hobby).trim())
          .filter(Boolean);
      } else {
        user.hobbies = String(hobbies)
          .split(",")
          .map((hobby) => hobby.trim())
          .filter(Boolean);
      }
    }

    // ==============================
    // ADDRESS
    // ==============================

    if (address) {
      user.address = {
        city:
          address.city !== undefined
            ? address.city.trim()
            : user.address?.city || "",

        district:
          address.district !== undefined
            ? address.district.trim()
            : user.address?.district || "",

        state:
          address.state !== undefined
            ? address.state.trim()
            : user.address?.state || "",

        zipCode:
          address.zipCode !== undefined
            ? address.zipCode.trim()
            : user.address?.zipCode || "",

        country:
          address.country !== undefined
            ? address.country.trim()
            : user.address?.country || "",
      };
    }

    // ==============================
    // PROFILE COMPLETION
    // ==============================

    user.profileComplete =
      Boolean(
        user.name &&
        user.phone &&
        user.dateOfBirth &&
        user.role &&
        user.address?.city &&
        user.address?.district &&
        user.address?.state &&
        user.address?.zipCode &&
        user.address?.country
      );

    await user.save();

    const safeUser =
      await User.findById(req.user.id)
        .select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    });

  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

exports.changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const user =
      await User.findById(req.user.id)
        .select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordCorrect =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different",
      });
    }

    user.password =
      await bcrypt.hash(
        newPassword,
        12
      );

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });

  } catch (error) {
    console.error(
      "Change Password Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPLOAD PROFILE IMAGE
// ==========================================

exports.uploadProfileImage = async (
  req,
  res
) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please select an image",
      });
    }

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // ==================================
    // UPLOAD BUFFER TO CLOUDINARY
    // ==================================

    const uploadToCloudinary =
      () => {
        return new Promise(
          (resolve, reject) => {

            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "taskflow/profiles",

                  public_id:
                    `user_${user._id}`,

                  overwrite: true,

                  resource_type:
                    "image",

                  transformation: [
                    {
                      width: 500,
                      height: 500,
                      crop: "fill",
                      gravity: "face",
                    },
                  ],
                },

                (error, result) => {

                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }

                }
              );

            stream.end(
              req.file.buffer
            );
          }
        );
      };

    const result =
      await uploadToCloudinary();

    // ==================================
    // SAVE CLOUDINARY URL
    // ==================================

    user.profileImage =
      result.secure_url;

    user.profileImagePublicId =
      result.public_id;

    await user.save();

    res.status(200).json({
      success: true,

      message:
        "Profile image uploaded successfully",

      profileImage:
        result.secure_url,

      profileImagePublicId:
        result.public_id,
    });

  } catch (error) {

    console.error(
      "Profile Image Upload Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to upload profile image",
    });
  }
};