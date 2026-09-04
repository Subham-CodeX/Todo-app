require("dotenv").config();

const http = require("http");

const express = require("express");

const cors = require("cors");

const { Server } = require("socket.io");

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


// ==========================================
// CONNECT DATABASE
// ==========================================

connectDB();


// ==========================================
// EXPRESS APP
// ==========================================

const app =
  express();


// ==========================================
// HTTP SERVER
// ==========================================

const server =
  http.createServer(
    app
  );


// ==========================================
// ALLOWED ORIGINS
// ==========================================

const allowedOrigins = [

  "http://localhost:5173",

  "http://127.0.0.1:5173",

  "https://todo-app-xi-five-57.vercel.app",

  process.env.CLIENT_URL,

]
  .filter(Boolean)
  .map(
    (origin) =>
      origin.replace(
        /\/$/,
        ""
      )
  );


// ==========================================
// CORS OPTIONS
// ==========================================

const corsOptions = {

  origin:
    (
      origin,
      callback
    ) => {

      // Allow requests without Origin
      // such as Postman or server-to-server

      if (
        !origin
      ) {

        return callback(
          null,
          true
        );

      }


      const normalizedOrigin =
        origin.replace(
          /\/$/,
          ""
        );


      if (
        allowedOrigins.includes(
          normalizedOrigin
        )
      ) {

        return callback(
          null,
          true
        );

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

  credentials:
    true,

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


// ==========================================
// EXPRESS MIDDLEWARE
// ==========================================

app.use(
  cors(
    corsOptions
  )
);

app.use(
  express.json({
    limit:
      "10mb",
  })
);


// ==========================================
// SOCKET.IO
// ==========================================

const io =
  new Server(
    server,
    {

      cors: {

        origin:
          corsOptions.origin,

        credentials:
          true,

        methods: [
          "GET",
          "POST",
        ],

      },

    }
  );


// ==========================================
// INITIALIZE SOCKET
// ==========================================

initializeSocket(
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

    res.status(200).json({

      success:
        true,

      message:
        "TaskFlow Backend is Running 🚀",

      environment:
        process.env.NODE_ENV ||
        "development",

    });

  }
);


// ==========================================
// API ROUTES
// ==========================================

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


// ==========================================
// CORS ERROR HANDLER
// ==========================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    if (
      error.message ===
      "Not allowed by CORS"
    ) {

      return res
        .status(403)
        .json({

          success:
            false,

          message:
            "CORS request blocked",

        });

    }


    next(
      error
    );

  }
);


// ==========================================
// SERVER PORT
// ==========================================

const PORT =
  process.env.PORT ||
  5000;


// ==========================================
// START SERVER
// ==========================================

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