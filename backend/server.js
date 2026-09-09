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

const noteRoutes =
  require("./routes/noteRoutes");

const authRoutes =
  require("./routes/authRoutes");

const userRoutes =
  require("./routes/userRoutes");

const connectionRoutes =
  require("./routes/connectionRoutes");

const messageRoutes =
  require(
    "./routes/messageRoutes"
  );

connectDB();

const app =
  express();


const server =
  http.createServer(
    app
  );


const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://todo-app-xi-five-57.vercel.app",
  "https://localhost",
  process.env.CLIENT_URL,
]
  .filter(Boolean)
  .map((origin) =>
    origin.replace(/\/+$/, "")
  );

const corsOptions = {
  origin: (origin, callback) => {

    // Allow Postman, mobile/native requests,
    // and server-to-server requests with no Origin header.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin =
      origin.replace(/\/+$/, "");

    if (
      allowedOrigins.includes(
        normalizedOrigin
      )
    ) {
      return callback(null, true);
    }

    console.error(
      "CORS blocked origin:",
      origin
    );

    return callback(
      new Error(
        "Not allowed by CORS"
      )
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(
  cors(
    corsOptions
  )
);


app.use(
  express.json(
    {
      limit:
        "10mb",
    }
  )
);


const io =
  new Server(
    server,
    {

      cors:
        {

          origin:
            corsOptions.origin,

          credentials:
            true,

          methods:
            [

              "GET",

              "POST",

            ],

        },

    }
  );

initializeSocket(
  io
);


app.get(
  "/",
  (
    req,
    res
  ) => {

    res.status(200).json(
      {

        success:
          true,

        message:
          "TaskFlow Backend is Running 🚀",

        environment:
          process.env.NODE_ENV ||
          "development",

      }
    );

  }
);


app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);


app.use(
  "/api/tasks",
  require(
    "./routes/taskRoutes"
  )
);


app.use(
  "/api/templates",
  require(
    "./routes/templateRoutes"
  )
);


app.use(
  "/api/notes",
  noteRoutes
);

app.use(
  "/api/connections",
  connectionRoutes
);

app.use(

  "/api/messages",

  messageRoutes

);


app.use(
  (
    req,
    res
  ) => {

    res.status(404).json(
      {

        success:
          false,

        message:
          `Route not found: ${req.method} ${req.originalUrl}`,

      }
    );

  }
);


app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "Server Error:",
      error
    );


    if (
      error.message ===
      "Not allowed by CORS"
    ) {

      return res
        .status(403)
        .json(
          {

            success:
              false,

            message:
              "CORS request blocked",

          }
        );

    }


    res
      .status(
        error.status ||
        500
      )
      .json(
        {

          success:
            false,

          message:
            error.message ||
            "Internal server error",

        }
      );

  }
);


const PORT =
  process.env.PORT ||
  5000;


server.listen(
  PORT,
  "0.0.0.0",
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

    console.log(
      "🔗 Allowed Origins:"
    );

    console.log(
      allowedOrigins
    );

  }
);