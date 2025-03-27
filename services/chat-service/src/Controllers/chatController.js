const chatService = require("../services/chatService");

const sendMessage = async (req, res) => {
  try {
    const { projectId, senderId, message } = req.body;
    const file = req.file || null; 

    if (!projectId || !senderId || (!message && !file)) {
      return res.status(400).json({ error: "Either message or file is required" });
    }

    const newMessage = await chatService.sendMessage(projectId, senderId, message, file);
    res.status(201).json({ message: "Message sent", newMessage });
  } catch (error) {
    console.error("SendMessage Error:", error.message);
    res.status(500).json({ error: "Error sending message", details: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const messages = await chatService.getMessages(projectId);
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};

module.exports = { sendMessage, getMessages };
