require("dotenv").config();
const noteRoutes = require("./routes/noteRoutes");

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/notes", noteRoutes);
// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Todo Backend is Running 🚀",
  });
});

// Routes
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/templates", require("./routes/templateRoutes"));
app.use("/api/notes", noteRoutes);

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});