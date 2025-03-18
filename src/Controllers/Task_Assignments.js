const db = require('../Database/database.js');
const fs = require("fs");
const path = require("path");

const createTaskAssignment = async (req, res) => {
    try {
        const { task_id, user_id } = req.body;

         const task = await db.oneOrNone('SELECT * FROM tasks WHERE id = $1', [task_id]);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

         const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [user_id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

         const newAssignment = await db.one(
            `INSERT INTO task_assignments (task_id, user_id) 
            VALUES ($1, $2) RETURNING *`,
            [task_id, user_id]
        );

        //creating default task_assignment_update for tracking 
        const status = 'To Do';
        await db.one(
            `INSERT INTO task_status_updates (task_id, updated_by, status) 
             VALUES ($1, $2, $3) RETURNING *`,
            [task_id, user_id, status]
        );

        res.status(201).json({ success: true, message: 'Task assigned successfully', assignment: newAssignment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error assigning task', error: error.message });
    }
};

const getSingleAssignedTask = async (req, res) => {
    try {
        const { task_id, user_id } = req.params;

        const assignment = await db.oneOrNone(
            `SELECT * FROM task_assignments WHERE task_id = $1 AND user_id = $2`,
            [task_id, user_id]
        );
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        res.status(200).json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching assignment', error: error.message });
    }
};

const deleteAssignedTask = async (req, res) => {
    try {
        const { task_id, user_id } = req.params;

         const assignment = await db.oneOrNone(
            `SELECT * FROM task_assignments WHERE task_id = $1 AND user_id = $2`,
            [task_id, user_id]
        );
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        await db.none(
            `DELETE FROM task_assignments WHERE task_id = $1 AND user_id = $2`,
            [task_id, user_id]
        );

        res.status(200).json({ success: true, message: 'Task assignment removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting assignment', error: error.message });
    }
};

const updateAssignedTask = async (req, res) => {
    try {
        const { task_id, user_id } = req.params;
        const { new_user_id } = req.body; 

        const task = await db.oneOrNone('SELECT * FROM tasks WHERE id = $1', [task_id]);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const assignment = await db.oneOrNone(
            `SELECT * FROM task_assignments WHERE task_id = $1 AND user_id = $2`,
            [task_id, user_id]
        );

        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Current assignment not found' });
        }

         const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [new_user_id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'New user not found' });
        }

         const updatedAssignment = await db.one(
            `UPDATE task_assignments SET user_id = $1 WHERE task_id = $2 AND user_id = $3 RETURNING *`,
            [new_user_id, task_id, user_id]
        );

        res.status(200).json({ success: true, message: 'Task assignment updated successfully', assignment: updatedAssignment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating assignment', error: error.message });
    }
};

const getUserAssignments = async (req, res) => {
    try {
        const { user_id } = req.params; 

        const assignments = await db.any(
            `SELECT t.id AS task_id, t.title, t.description, t.status, t.priority, t.deadline, t.estimated_hours, t.file_url, t.created_at, t.updated_at
            FROM task_assignments ta
            JOIN tasks t ON ta.task_id = t.id
            WHERE ta.user_id = $1`,
            [user_id]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ success: false, message: 'No assignments found for this user' });
        }

        res.status(200).json({ success: true, assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching assignments', error: error.message });
    }
};

// this one for backwards compatibility
const createTaskStatusUpdate = async (req, res) => {
    try {
        const { task_id, updated_by, status } = req.body;

         const task = await db.oneOrNone('SELECT * FROM tasks WHERE id = $1', [task_id]);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

         const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [updated_by]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

         const newStatusUpdate = await db.one(
            `INSERT INTO task_status_updates (task_id, updated_by, status) 
            VALUES ($1, $2, $3) RETURNING *`,
            [task_id, updated_by, status]
        );

        res.status(201).json({ success: true, message: 'Task status updated successfully', statusUpdate: newStatusUpdate });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating task status', error: error.message });
    }
};

const editTaskStatusUpdate = async (req, res) => {
    try {
        const { status_update_id } = req.params; 
        const { status } = req.body; 

         const existingStatusUpdate = await db.oneOrNone(
            'SELECT * FROM task_status_updates WHERE id = $1',
            [status_update_id]
        );
        if (!existingStatusUpdate) {
            return res.status(404).json({ success: false, message: 'Status update not found' });
        }

         const updatedStatus = await db.one(
            `UPDATE task_status_updates 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [status, status_update_id]
        );

        res.status(200).json({
            success: true,
            message: 'Task status updated successfully',
            statusUpdate: updatedStatus
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating task status', error: error.message });
    }
};

const getUserTaskStatusUpdates = async (req, res) => {
    try {
        const { user_id } = req.params; 

        const statusUpdates = await db.any(
            `SELECT tsu.*, 
                    t.title AS task_title, 
                    t.description AS task_description, 
                    t.deadline AS task_due_date, 
                    t.priority AS task_priority, 
                    t.status AS task_status,
                    t.created_at AS task_created_at
             FROM task_status_updates tsu
             JOIN tasks t ON tsu.task_id = t.id
             WHERE tsu.updated_by = $1
             ORDER BY tsu.updated_at DESC`, 
            [user_id]
        );

        if (statusUpdates.length === 0) {
            return res.status(404).json({ success: false, message: 'No task status updates found for this user' });
        }

        res.status(200).json({ success: true, statusUpdates });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching task status updates', error: error.message });
    }
};

const getAllTaskStatusUpdates = async (req, res) => {
    try {
        const statusUpdates = await db.any(
            `SELECT tsu.*, 
                    t.title AS task_title, 
                    t.description AS task_description, 
                    t.deadline AS task_due_date, 
                    t.priority AS task_priority, 
                    u.name AS assigned_user,
                    u.profile_image AS profile_image
             FROM task_status_updates tsu
             JOIN tasks t ON tsu.task_id = t.id
             JOIN users u ON tsu.updated_by = u.id
             ORDER BY tsu.updated_at DESC`
        );

        if (statusUpdates.length === 0) {
            return res.status(404).json({ success: false, message: 'No task status updates found' });
        }

        res.status(200).json({ success: true, statusUpdates });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching task status updates', error: error.message });
    }
};

const submitTheTask = async (req, res) => {
    try {
        const { task_id } = req.params;
        const { updated_by, status } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'File is required' });
        }

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const file_url = `${process.env.BASE_URL}/public/${req.file.filename}`;

        const allowedStatuses = ['To Do', 'In Progress', 'Review', 'Completed'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        const task = await db.oneOrNone('SELECT * FROM tasks WHERE id = $1', [task_id]);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [updated_by]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (task.file_url) {
            const oldFilePath = path.join(__dirname, "..", "public", task.file_url.replace(`${process.env.BASE_URL}/public/`, ""));
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

        const updateQuery = `UPDATE tasks SET 
                            status = $1, 
                            file_url = $2,
                            updated_at = NOW() 
                            WHERE id = $3 RETURNING *`;
        const queryParams = [status, file_url, task_id];

        const updatedTask = await db.one(updateQuery, queryParams);

         const updateStatusQuery = `
            UPDATE task_status_updates
            SET status = $1, updated_by = $2, updated_at = NOW()
            WHERE task_id = $3
            RETURNING *;
        `;
        const statusUpdateParams = [status, updated_by, task_id];
        const updatedStatus = await db.oneOrNone(updateStatusQuery, statusUpdateParams);

        if (!updatedStatus) {
            return res.status(404).json({ success: false, message: 'No existing status update found for this task' });
        }

         res.status(200).json({ 
            success: true, 
            message: 'Task  updated successfully', 
            task: updatedTask, 
            taskStatusUpdate: updatedStatus 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating task status and file', error: error.message });
    }
};

module.exports = {
    createTaskAssignment,
    getSingleAssignedTask,
    deleteAssignedTask,
    updateAssignedTask,
    getUserAssignments,
    createTaskStatusUpdate,
    editTaskStatusUpdate,
    getUserTaskStatusUpdates,
    getAllTaskStatusUpdates,
    submitTheTask
}

