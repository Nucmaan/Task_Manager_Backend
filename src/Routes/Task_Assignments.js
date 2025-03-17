const { createTaskAssignment, getSingleAssignedTask, updateAssignedTask, deleteAssignedTask, getUserAssignments, createTaskStatusUpdate } = require("../Controllers/Task_Assignments.js");

const Router = require("express").Router();

Router.post("/assignTask",createTaskAssignment);
Router.get('/assign/:task_id/:user_id', getSingleAssignedTask);
Router.delete('/assign/:task_id/:user_id', deleteAssignedTask);
Router.put('/assign/:task_id/:user_id', updateAssignedTask);

Router.get('/userAssignments/:user_id',getUserAssignments);

//start the Task for the first time

Router.post('/task_status/update', createTaskStatusUpdate);



module.exports = Router;
