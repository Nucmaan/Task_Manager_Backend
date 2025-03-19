const TaskAssignmentService = require("../Services/taskAssignmentService.js");

const getSingleAssignedTask = async (req, res) => {
    try {
        const assignment = await TaskAssignmentService.getSingleAssignment(req.params.task_id, req.params.user_id);
        assignment 
            ? res.status(200).json({ success: true, assignment })
            : res.status(404).json({ success: false, message: 'Assignment not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching assignment', error: error.message });
    }
};

const deleteAssignedTask = async (req, res) => {
    try {
        const isDeleted = await TaskAssignmentService.deleteAssignment(req.params.task_id, req.params.user_id);
        isDeleted 
            ? res.status(200).json({ success: true, message: 'Task assignment removed successfully' })
            : res.status(404).json({ success: false, message: 'Assignment not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting assignment', error: error.message });
    }
};

const createTaskAssignment = async (req, res) => {
    try {
        const assignment = await TaskAssignmentService.createAssignment(req.body.task_id, req.body.user_id);
        res.status(201).json({ success: true, message: 'Task assigned successfully', assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error assigning task', error: error.message });
    }
};

const updateAssignedTask = async (req, res) => {
    try {
        const assignment = await TaskAssignmentService.updateAssignment(
            req.params.task_id, 
            req.params.user_id, 
            req.body.new_user_id
        );
        res.status(200).json({ success: true, message: 'Task assignment updated successfully', assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating assignment', error: error.message });
    }
};

const getUserAssignments = async (req, res) => {
    try {
        const assignments = await TaskAssignmentService.getUserAssignments(req.params.user_id);
        assignments.length > 0 
            ? res.status(200).json({ success: true, assignments })
            : res.status(404).json({ success: false, message: 'No assignments found' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching assignments', error: error.message });
    }
};

const editTaskStatusUpdate = async (req, res) => {
    try {
        const statusUpdate = await TaskAssignmentService.editStatusUpdate(
            req.params.status_update_id, 
            req.body.status
        );
        res.status(200).json({ success: true, message: 'Status updated', statusUpdate });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
    }
};

const getUserTaskStatusUpdates = async (req, res) => {
    try {
        const statusUpdates = await TaskAssignmentService.getUserStatusUpdates(req.params.user_id);
        statusUpdates.length > 0 
            ? res.status(200).json({ success: true, statusUpdates })
            : res.status(404).json({ success: false, message: 'No updates found' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching updates', error: error.message });
    }
};

const getAllTaskStatusUpdates = async (req, res) => {
    try {
        const statusUpdates = await TaskAssignmentService.getAllStatusUpdates();
        statusUpdates.length > 0 
            ? res.status(200).json({ success: true, statusUpdates })
            : res.status(404).json({ success: false, message: 'No updates found' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching updates', error: error.message });
    }
};

const submitTheTask = async (req, res) => {
    try {
        const result = await TaskAssignmentService.submitTask(
            req.params.task_id,
            req.body.updated_by,
            req.body.status,
            req.file
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error submitting task', error: error.message });
    }
};

module.exports = {
    createTaskAssignment,
    getSingleAssignedTask,
    deleteAssignedTask,
    updateAssignedTask,
    getUserAssignments,
    editTaskStatusUpdate,
    getUserTaskStatusUpdates,
    getAllTaskStatusUpdates,
    submitTheTask
};