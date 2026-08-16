const express = require("express");

const router =
  express.Router();

const {
  createTemplate,
  getTemplates,
  deleteTemplate,
  updateTemplate,
  useTemplate,
} = require(
  "../controllers/taskController"
);

const protect =
  require(
    "../middleware/authMiddleware"
  );

// Every template route requires login
router.use(protect);

router.post(
  "/",
  createTemplate
);

router.get(
  "/",
  getTemplates
);

router.put(
  "/:id",
  updateTemplate
);

router.delete(
  "/:id",
  deleteTemplate
);

router.post(
  "/:id/use",
  useTemplate
);

module.exports = router;