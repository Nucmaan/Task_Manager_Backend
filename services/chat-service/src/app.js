const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./Config/db.js");
const chatRoutes = require("./routes/chatRoutes.js");

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/chat", chatRoutes);



module.exports = app;
