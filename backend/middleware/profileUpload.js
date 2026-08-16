const multer = require("multer");

const storage =
  multer.memoryStorage();

const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files are allowed"
      ),
      false
    );
  }
};

const profileUpload = multer({
  storage,

  limits: {
    fileSize:
      2 * 1024 * 1024,
  },

  fileFilter,
});

module.exports = profileUpload;