const express = require("express");

const router =
  express.Router();

const {
  createTask,
  getTasks,
  deleteTask,
  updateTask,
} = require(
  "../controllers/taskController"
);

const protect =
  require(
    "../middleware/authMiddleware"
  );

// Every task route requires login
router.use(protect);

router.get(
  "/",
  getTasks
);

router.post(
  "/",
  createTask
);

router.delete(
  "/:id",
  deleteTask
);

router.put(
  "/:id",
  updateTask
);

module.exports = router;