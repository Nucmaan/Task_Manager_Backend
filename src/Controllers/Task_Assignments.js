const db = require('../Database/database.js');

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


const createTaskStatusUpdate = async (req, res) => {
    try {
        const { task_id, updated_by, status } = req.body;

        // Check if the task exists
        const task = await db.oneOrNone('SELECT * FROM tasks WHERE id = $1', [task_id]);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Check if the user exists
        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [updated_by]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Insert the status update into the task_status_updates table
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


module.exports = {
    createTaskAssignment,
    getSingleAssignedTask,
    deleteAssignedTask,
    updateAssignedTask,
    getUserAssignments,
    createTaskStatusUpdate
}
