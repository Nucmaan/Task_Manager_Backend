const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const   rateLimit  = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, 
	limit: 100,
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
  message: 'Too many requests from this IP, please try again later.'  
 })

 app.use(limiter)

app.use(cors());
app.use(express.json());

app.use("/api/project", proxy("http://localhost:8002"));
app.use("/api/auth", proxy("http://localhost:8001"));
app.use("/api/task", proxy("http://localhost:8003"));
app.use("/api/task-assignment", proxy("http://localhost:8003"));


app.listen(8000, () => {
  console.log("Gateway is Listening to Port 8000");
});