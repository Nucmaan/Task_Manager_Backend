const Router = require("express").Router();
const { createTask, getSingleTask, getAllTasks, deleteTask, getAllProjectTasks, updateTask } = require("../Controllers/Task.js");
const { upload } = require("../middleware/uploadMiddleware.js");

Router.post("/addTask",upload.single("file_url"), createTask);
Router.get("/singleTask/:id", getSingleTask);
Router.delete("/deleteSingleTask/:id",deleteTask);
Router.get("/allTasks", getAllTasks);
Router.put("/updateTask/:id",upload.single("file_url"),updateTask);
Router.get("/projectTasks/:project_id",getAllProjectTasks);


module.exports = Router;
