require("dotenv").config();

const http =
  require("http");

const express =
  require("express");

const cors =
  require("cors");

const {
  Server,
} =
  require("socket.io");

const connectDB =
  require("./config/db");

const initializeSocket =
  require("./socket/socketServer");

// ==========================================
// ROUTES
// ==========================================

const noteRoutes =
  require("./routes/noteRoutes");

const authRoutes =
  require("./routes/authRoutes");

const userRoutes =
  require("./routes/userRoutes");

const connectionRoutes =
  require("./routes/connectionRoutes");

const taskRoutes =
  require("./routes/taskRoutes");

const templateRoutes =
  require("./routes/templateRoutes");

// ==========================================
// CONNECT DATABASE
// ==========================================

connectDB();

// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app =
  express();

// ==========================================
// CREATE HTTP SERVER
// ==========================================

const server =
  http.createServer(
    app
  );

// ==========================================
// ALLOWED CORS ORIGINS
// ==========================================

const allowedOrigins =
  [
    "http://localhost:5173",

    process.env.CLIENT_URL,
  ].filter(Boolean);

// ==========================================
// EXPRESS MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin:
      allowedOrigins,

    credentials:
      true,
  })
);

app.use(
  express.json()
);

// ==========================================
// SOCKET.IO SERVER
// ==========================================

const io =
  new Server(
    server,
    {
      cors: {
        origin:
          allowedOrigins,

        methods: [
          "GET",
          "POST",
        ],

        credentials:
          true,
      },
    }
  );

// ==========================================
// INITIALIZE SOCKET.IO
// ==========================================

initializeSocket(
  io
);

// ==========================================
// OPTIONAL: MAKE IO AVAILABLE IN ROUTES
// ==========================================

app.set(
  "io",
  io
);

// ==========================================
// TEST ROUTE
// ==========================================

app.get(
  "/",
  (
    req,
    res
  ) => {

    res.json({
      success:
        true,

      message:
        "TaskFlow Backend is Running 🚀",
    });

  }
);

// ==========================================
// API ROUTES
// ==========================================

// Authentication

app.use(
  "/api/auth",
  authRoutes
);

// Users

app.use(
  "/api/users",
  userRoutes
);

// Connections

app.use(
  "/api/connections",
  connectionRoutes
);

// Tasks

app.use(
  "/api/tasks",
  taskRoutes
);

// Templates

app.use(
  "/api/templates",
  templateRoutes
);

// Notes

app.use(
  "/api/notes",
  noteRoutes
);

// ==========================================
// 404 HANDLER
// ==========================================

app.use(
  (
    req,
    res
  ) => {

    res.status(
      404
    ).json({
      success:
        false,

      message:
        "API route not found",
    });

  }
);

// ==========================================
// SERVER ERROR HANDLER
// ==========================================

server.on(
  "error",
  (
    error
  ) => {

    console.error(
      "Server Error:",
      error
    );

  }
);

// PORT

const PORT =
  process.env.PORT ||
  5000;

// START SERVER

server.listen(
  PORT,
  () => {

    console.log(
      `🚀 TaskFlow server running on port ${PORT}`
    );

    console.log(
      `🌐 Environment: ${
        process.env.NODE_ENV ||
        "development"
      }`
    );

  }
);