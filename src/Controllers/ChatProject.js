const db = require('../Database/database.js');

const addProjectChat = async (req, res) => {
    try {
        const { project_id } = req.params;
        const { user_id, comment } = req.body;

        // Ensure that the project exists
        const project = await db.oneOrNone('SELECT * FROM projects WHERE id = $1', [project_id]);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Ensure that the user exists
        const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [user_id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Insert the chat/comment into the project_chat table
        const newChat = await db.one(
            'INSERT INTO project_chat (project_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *',
            [project_id, user_id, comment]
        );

        res.status(201).json({
            success: true,
            message: 'Chat added successfully',
            chat: newChat,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding chat', error: error.message });
    }
};

const getProjectChats = async (req, res) => {
    try {
        const { project_id } = req.params;

        // Ensure that the project exists
        const project = await db.oneOrNone('SELECT * FROM projects WHERE id = $1', [project_id]);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Retrieve all chats for the project
        const chats = await db.any(
            'SELECT c.id, c.comment, c.created_at, u.username FROM project_chat c JOIN users u ON c.user_id = u.id WHERE c.project_id = $1 ORDER BY c.created_at DESC',
            [project_id]
        );

        res.status(200).json({
            success: true,
            chats: chats,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching chats', error: error.message });
    }
};

const deleteProjectChat = async (req, res) => {
    try {
        const { chat_id } = req.params;
        const { user_id } = req.body;

        // Ensure that the chat exists
        const chat = await db.oneOrNone('SELECT * FROM project_chat WHERE id = $1', [chat_id]);
        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' });
        }

        // Ensure that the user is the one who created the chat
        if (chat.user_id !== user_id) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this chat' });
        }

        // Delete the chat
        await db.none('DELETE FROM project_chat WHERE id = $1', [chat_id]);

        res.status(200).json({
            success: true,
            message: 'Chat deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting chat', error: error.message });
    }
};

module.exports = {
    addProjectChat,
    getProjectChats,
    deleteProjectChat,
};





