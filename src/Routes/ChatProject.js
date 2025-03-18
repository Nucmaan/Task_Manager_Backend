const { addProjectChat, getProjectChats, deleteProjectChat } = require('../Controllers/ChatProject.js');
const router = require('express').Router();

 
router.post('/projects/:project_id/chats', addProjectChat); 
router.get('/projects/:project_id/chats', getProjectChats); 
router.delete('/chats/:chat_id', deleteProjectChat);

module.exports = router;
