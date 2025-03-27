const Router = require("express").Router();
const { createTask, getSingleTask, getAllTasks, deleteTask, getAllProjectTasks, updateTask } = require("../Controllers/Task.js");
const { upload } = require("../middleware/uploadMiddleware.js");
const { authMiddleware, isLogin } = require('../middleware/authMiddleware.js');

Router.post("/addTask",upload.single("file_url"), createTask);
Router.get("/singleTask/:id",isLogin, getSingleTask);
Router.delete("/deleteSingleTask/:id",authMiddleware,deleteTask);
Router.get("/allTasks", getAllTasks);
Router.put("/updateTask/:id",isLogin,upload.single("file_url"),updateTask);
Router.get("/projectTasks/:project_id",authMiddleware,getAllProjectTasks);


module.exports = Router;
