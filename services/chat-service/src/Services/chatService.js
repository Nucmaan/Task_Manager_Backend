const Message = require("../Models/messageModel.js");

const sendMessage = async (projectId, senderId, message, file) => {
  try {
    const newMessage = new Message({
      projectId,
      senderId,
      message: file ? `${process.env.BASE_URL}/public/${file.filename}` : message, 
      file: file ? `${process.env.BASE_URL}/public/${file.filename}` : null, 
    });

    await newMessage.save();
    return newMessage;
  } catch (error) {
    console.error("Error saving message:", error.message);
    throw error;
  }
};

const getMessages = async (projectId) => {
  try {
    return await Message.find({ projectId }).sort({ createdAt: 1 });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    throw error;
  }
};

module.exports = { sendMessage, getMessages };
