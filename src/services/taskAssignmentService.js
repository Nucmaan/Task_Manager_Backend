const TaskDb = require("../Database/TaskDb.js");
const fs = require("fs");
const path = require("path");

const getSingleAssignment = async (taskId, userId) => {
    return await TaskDb.oneOrNone(
        `SELECT * FROM task_assignments WHERE task_id = $1 AND user_id = $2`,
        [taskId, userId]
    );
};

const deleteAssignment = async (taskId, userId) => {
    const assignment = await TaskDb.result(
        `DELETE FROM task_assignments WHERE task_id = $1 AND user_id = $2`,
        [taskId, userId]
    );
    return assignment.rowCount > 0;
};

const createAssignment = async (taskId, userId) => {
    const task = await TaskDb.oneOrNone('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (!task) throw new Error('Task not found');

    const user = await TaskDb.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user) throw new Error('User not found');

    const newAssignment = await TaskDb.one(
        `INSERT INTO task_assignments (task_id, user_id) 
         VALUES ($1, $2) RETURNING *`,
        [taskId, userId]
    );

    await TaskDb.one(
        `INSERT INTO task_status_updates (task_id, updated_by, status) 
         VALUES ($1, $2, $3) RETURNING *`,
        [taskId, userId, 'To Do']
    );

    return newAssignment;
};

const updateAssignment = async (taskId, oldUserId, newUserId) => {
    const user = await TaskDb.oneOrNone('SELECT * FROM users WHERE id = $1', [newUserId]);
    if (!user) throw new Error('New user not found');

    const assignment = await TaskDb.one(
        `UPDATE task_assignments SET user_id = $1 
         WHERE task_id = $2 AND user_id = $3 RETURNING *`,
        [newUserId, taskId, oldUserId]
    );
    return assignment;
};

const getUserAssignments = async (userId) => {
    return await TaskDb.any(
        `SELECT t.id AS task_id, t.title, t.description, t.status, t.priority, t.deadline, 
                t.estimated_hours, t.file_url, t.created_at, t.updated_at
         FROM task_assignments ta
         JOIN tasks t ON ta.task_id = t.id
         WHERE ta.user_id = $1`,
        [userId]
    );
};

const editStatusUpdate = async (statusUpdateId, status) => {
    const updatedStatus = await TaskDb.one(
        `UPDATE task_status_updates 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`,
        [status, statusUpdateId]
    );
    return updatedStatus;
};

const getUserStatusUpdates = async (userId) => {
    return await TaskDb.any(
        `SELECT tsu.*, t.title AS task_title, t.description AS task_description,
                t.deadline AS task_due_date, t.priority AS task_priority, 
                t.status AS task_status, t.created_at AS task_created_at
         FROM task_status_updates tsu
         JOIN tasks t ON tsu.task_id = t.id
         WHERE tsu.updated_by = $1
         ORDER BY tsu.updated_at DESC`,
        [userId]
    );
};

const getAllStatusUpdates = async () => {
    return await TaskDb.any(
        `SELECT tsu.*, t.title AS task_title, t.description AS task_description,
                t.deadline AS task_due_date, t.priority AS task_priority,
                u.name AS assigned_user, u.profile_image AS profile_image
         FROM task_status_updates tsu
         JOIN tasks t ON tsu.task_id = t.id
         JOIN users u ON tsu.updated_by = u.id
         ORDER BY tsu.updated_at DESC`
    );
};

const submitTask = async (taskId, updatedBy, status, file) => {
    if (!file) throw new Error('File is required');
    if (!status) throw new Error('Status is required');

    const allowedStatuses = ['To Do', 'In Progress', 'Review', 'Completed'];
    if (!allowedStatuses.includes(status)) throw new Error('Invalid status');

    const task = await TaskDb.oneOrNone('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (!task) throw new Error('Task not found');

    const user = await TaskDb.oneOrNone('SELECT * FROM users WHERE id = $1', [updatedBy]);
    if (!user) throw new Error('User not found');

    const file_url = `${process.env.BASE_URL}/public/${file.filename}`;

    if (task.file_url) {
        const oldFilePath = path.join(__dirname, "..", "public", task.file_url.replace(`${process.env.BASE_URL}/public/`, ""));
        fs.unlink(oldFilePath, (err) => { if (err) console.error('Error deleting file:', err) });
    }

    const updatedTask = await TaskDb.one(
        `UPDATE tasks SET status = $1, file_url = $2, updated_at = NOW()
         WHERE id = $3 RETURNING *`,
        [status, file_url, taskId]
    );

    const updatedStatus = await TaskDb.one(
        `UPDATE task_status_updates
         SET status = $1, updated_by = $2, updated_at = NOW()
         WHERE task_id = $3 RETURNING *`,
        [status, updatedBy, taskId]
    );

    return { 
        success: true, 
        message: 'Task updated successfully', 
        task: updatedTask, 
        taskStatusUpdate: updatedStatus 
    };
};

module.exports = {
    getSingleAssignment,
    deleteAssignment,
    createAssignment,
    updateAssignment,
    getUserAssignments,
    editStatusUpdate,
    getUserStatusUpdates,
    getAllStatusUpdates,
    submitTask
};