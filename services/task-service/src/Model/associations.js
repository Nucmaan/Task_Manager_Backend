const Task = require("./TasksModel");
const TaskAssignment = require("./task_assignments");

 Task.hasMany(TaskAssignment, { foreignKey: "task_id" });
TaskAssignment.belongsTo(Task, { foreignKey: "task_id" });

module.exports = { Task, TaskAssignment };
