const express = require("express");
const mongoose = require("mongoose");
const performanceRoutes = require("./routes/performanceRoutes");

const app = express();
app.use(express.json());


app.use("/api/performance", performanceRoutes);



module.exports = app;
