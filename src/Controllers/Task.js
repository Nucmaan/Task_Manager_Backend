const fs = require("fs");
const path = require("path");
const TaskDb = require("../Database/TaskDb.js");


const createTask = async (req, res) => {
    try {
        const { title, description, project_id, status, priority, deadline, estimated_hours } = req.body;

        const file_url = req.file ? `${process.env.BASE_URL}/public/${req.file.filename}` : null;

        const newTask = await TaskDb.one(
            `INSERT INTO tasks (title, description, project_id, status, priority, deadline, estimated_hours, file_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [title, description, project_id, status || 'To Do', priority || 'Medium', deadline, estimated_hours, file_url]
        );
        res.status(201).json({ success: true, message: "Task created successfully", task: newTask });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating task", error: error.message });
    }
};

const getSingleTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await TaskDb.oneOrNone(
            `SELECT t.*, p.name AS project_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.id = $1`,
            [id]
        );

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching task", error: error.message });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const tasks = await TaskDb.any(
            `SELECT t.*, p.name AS project_name
            FROM tasks t 
            LEFT JOIN projects p ON t.project_id = p.id`
        );
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching tasks", error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await TaskDb.none('DELETE FROM tasks WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting task", error: error.message });
    }
};

const getAllProjectTasks = async (req, res) => {
    try {
        const { project_id } = req.params;

        if (!project_id) {
            return res.status(400).json({ success: false, message: "Invalid project ID" });
        }

        const tasks = await TaskDb.any(
            `SELECT t.*, p.name AS project_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.project_id = $1`,
            [project_id]
        );

        if (tasks.length === 0) {
            return res.status(404).json({ success: false, message: "No tasks found for this project" });
        }

        res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error("Error fetching project tasks:", error);
        res.status(500).json({ success: false, message: "Error fetching project tasks", error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, project_id, status, priority, deadline, estimated_hours, completed_at } = req.body;
        let file_url = null;

        if (req.file) {
            file_url = `${process.env.BASE_URL}/public/${req.file.filename}`;
        }

         const currentTask = await TaskDb.oneOrNone(
            `SELECT file_url FROM tasks WHERE id = $1`,
            [id]
        );

        if (!currentTask) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

         if (file_url && currentTask.file_url) {
            const oldFilePath = path.join(__dirname, "..", "public", currentTask.file_url.replace(`${process.env.BASE_URL}/public/`, ""));
            fs.access(oldFilePath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(oldFilePath, (deleteErr) => {
                        if (deleteErr) {
                            console.error("Error deleting old task file:", deleteErr);
                        }
                    });
                }
            });
        }

         let updateQuery = `UPDATE tasks SET `;
        let queryParams = [];
        let setClause = [];

        if (title) {
            setClause.push(`title = $${setClause.length + 1}`);
            queryParams.push(title);
        }
        if (description) {
            setClause.push(`description = $${setClause.length + 1}`);
            queryParams.push(description);
        }
        if (project_id) {
            setClause.push(`project_id = $${setClause.length + 1}`);
            queryParams.push(project_id);
        }
        if (status) {
            setClause.push(`status = $${setClause.length + 1}`);
            queryParams.push(status);
        }
        if (priority) {
            setClause.push(`priority = $${setClause.length + 1}`);
            queryParams.push(priority);
        }
        if (deadline) {
            setClause.push(`deadline = $${setClause.length + 1}`);
            queryParams.push(deadline);
        }
        if (estimated_hours) {
            setClause.push(`estimated_hours = $${setClause.length + 1}`);
            queryParams.push(estimated_hours);
        }
        if (completed_at) {
            setClause.push(`completed_at = $${setClause.length + 1}`);
            queryParams.push(completed_at);
        }
        if (file_url) {
            setClause.push(`file_url = $${setClause.length + 1}`);
            queryParams.push(file_url);
        }

        if (setClause.length === 0) {
            return res.status(400).json({ success: false, message: "No fields provided for update" });
        }

        updateQuery += setClause.join(", ") + ` WHERE id = $${queryParams.length + 1} RETURNING *`;
        queryParams.push(id);

        const updatedTask = await TaskDb.one(updateQuery, queryParams);

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task: updatedTask,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating task", error: error.message });
    }
};


module.exports = {
    createTask,
    getSingleTask,
    getAllTasks,
    deleteTask,
    getAllProjectTasks,
    updateTask
}