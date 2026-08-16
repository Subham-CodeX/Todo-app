require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const noteRoutes =
  require("./routes/noteRoutes");

const authRoutes =
  require("./routes/authRoutes");

connectDB();

const app = express();

// ==========================
// Middleware
// ==========================
app.use(cors());
app.use(express.json());

// ==========================
// Test Route
// ==========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Todo Backend is Running 🚀",
  });
});

// ==========================
// Routes
// ==========================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/tasks",
  require("./routes/taskRoutes")
);

app.use(
  "/api/templates",
  require("./routes/templateRoutes")
);

app.use(
  "/api/notes",
  noteRoutes
);

// ==========================
// PORT
// ==========================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});