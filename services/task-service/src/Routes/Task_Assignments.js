const { createTaskAssignment, updateAssignedTask, getUserAssignments, editTaskStatusUpdate, getUserTaskStatusUpdates, getAllTaskStatusUpdates, submitTheTask } = require("../Controllers/Task_Assignments.js");
const { authMiddleware, isLogin } = require('../middleware/authMiddleware.js');
const Router = require("express").Router();
const { upload } = require('../middleware/uploadMiddleware.js'); 

Router.post("/assignTask",authMiddleware,createTaskAssignment);
Router.put('/assign/:task_id/:user_id', isLogin,updateAssignedTask);

Router.get('/userAssignments/:user_id',isLogin,getUserAssignments);


Router.put('/task_status_update/:status_update_id',isLogin,editTaskStatusUpdate);
Router.get('/findMyTaskStatusUpdate/:user_id',isLogin,getUserTaskStatusUpdates);
Router.get('/allTaskStatusUpdates',authMiddleware,getAllTaskStatusUpdates);
Router.put('/submitTask/:task_id',isLogin,upload.single('file_url'),submitTheTask);

module.exports = Router;
