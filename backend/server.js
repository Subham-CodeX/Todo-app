require("dotenv").config();

const express =
require("express");

const cors =
require("cors");

const connectDB =
require("./config/db");

connectDB();

const app =
express();

app.use(cors());

app.use(express.json());

app.use(
"/api/tasks",
require("./routes/taskRoutes")
);

app.use(
"/api/templates",
require("./routes/templateRoutes")
);

app.listen(

process.env.PORT,

()=>{

console.log(
`Server running on ${process.env.PORT}`
);

});