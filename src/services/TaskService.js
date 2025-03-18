const TaskDb = require("../Database/TaskDb.js");
const fs = require("fs");
const path = require("path");

const createTask = async (taskData, file) => {
    try {
        const { title, description, project_id, status, priority, deadline, estimated_hours } = taskData;
        const file_url = file ? `${process.env.BASE_URL}/public/${file.filename}` : null;

        const newTask = await TaskDb.one(
            `INSERT INTO tasks (title, description, project_id, status, priority, deadline, estimated_hours, file_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [title, description, project_id, status || 'To Do', priority || 'Medium', deadline, estimated_hours, file_url]
        );
        return { success: true, message: "Task created successfully", task: newTask };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getSingleTask = async (id) => {
    try {
        const task = await TaskDb.oneOrNone(
            `SELECT t.*, p.name AS project_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.id = $1`,
            [id]
        );

        if (!task) {
            return { success: false, message: "Task not found" };
        }

        return { success: true, task };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAllTasks = async () => {
    try {
        const tasks = await TaskDb.any(
            `SELECT t.*, p.name AS project_name
            FROM tasks t 
            LEFT JOIN projects p ON t.project_id = p.id`
        );
        return { success: true, tasks };
    } catch (error) {
        throw new Error(error.message);
    }
};

const deleteTask = async (id) => {
    try {
        await TaskDb.none('DELETE FROM tasks WHERE id = $1', [id]);
        return { success: true, message: "Task deleted successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAllProjectTasks = async (project_id) => {
    try {
        if (!project_id) {
            return { success: false, message: "Invalid project ID" };
        }

        const tasks = await TaskDb.any(
            `SELECT t.*, p.name AS project_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.project_id = $1`,
            [project_id]
        );

        if (tasks.length === 0) {
            return { success: false, message: "No tasks found for this project" };
        }

        return { success: true, tasks };
    } catch (error) {
        throw new Error(error.message);
    }
};

const updateTask = async (id, taskData, file) => {
    try {
        const { title, description, project_id, status, priority, deadline, estimated_hours, completed_at } = taskData;
        let file_url = file ? `${process.env.BASE_URL}/public/${file.filename}` : null;

        const currentTask = await TaskDb.oneOrNone(
            `SELECT file_url FROM tasks WHERE id = $1`,
            [id]
        );

        if (!currentTask) {
            return { success: false, message: "Task not found" };
        }

        if (file_url && currentTask.file_url) {
            const oldFilePath = path.join(__dirname, "..", "public", currentTask.file_url.replace(`${process.env.BASE_URL}/public/`, ""));
            fs.access(oldFilePath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(oldFilePath, (deleteErr) => {
                        if (deleteErr) console.error("Error deleting old task file:", deleteErr);
                    });
                }
            });
        }

        let updateQuery = `UPDATE tasks SET `;
        let queryParams = [];
        let setClause = [];

        if (title) { setClause.push(`title = $${setClause.length + 1}`); queryParams.push(title); }
        if (description) { setClause.push(`description = $${setClause.length + 1}`); queryParams.push(description); }
        if (project_id) { setClause.push(`project_id = $${setClause.length + 1}`); queryParams.push(project_id); }
        if (status) { setClause.push(`status = $${setClause.length + 1}`); queryParams.push(status); }
        if (priority) { setClause.push(`priority = $${setClause.length + 1}`); queryParams.push(priority); }
        if (deadline) { setClause.push(`deadline = $${setClause.length + 1}`); queryParams.push(deadline); }
        if (estimated_hours) { setClause.push(`estimated_hours = $${setClause.length + 1}`); queryParams.push(estimated_hours); }
        if (completed_at) { setClause.push(`completed_at = $${setClause.length + 1}`); queryParams.push(completed_at); }
        if (file_url) { setClause.push(`file_url = $${setClause.length + 1}`); queryParams.push(file_url); }

        if (setClause.length === 0) {
            return { success: false, message: "No fields provided for update" };
        }

        updateQuery += setClause.join(", ") + ` WHERE id = $${queryParams.length + 1} RETURNING *`;
        queryParams.push(id);

        const updatedTask = await TaskDb.one(updateQuery, queryParams);

        return { success: true, message: "Task updated successfully", task: updatedTask };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    createTask,
    getSingleTask,
    getAllTasks,
    deleteTask,
    getAllProjectTasks,
    updateTask
};
