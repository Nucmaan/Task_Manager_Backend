const notificationService = require("../Services/notificationService.js");

// 🟢 Send Normal Notification
const createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;
    await notificationService.createNotification(userId, message); // 🟢 Updated function name
    res.status(200).json({ message: "Notification created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error: error.message });
  }
};

// 🟢 Send Scheduled Notification
const createScheduledNotification = async (req, res) => {
  try {
    const { userId, message, deadline } = req.body;
    const scheduled = await notificationService.createScheduledNotification(userId, message, deadline);
    res.status(200).json({ message: "Scheduled notification created successfully", scheduled });
  } catch (error) {
    res.status(500).json({ message: "Error scheduling notification", error: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await notificationService.getNotifications(userId);
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

module.exports = {
  createNotification,
  createScheduledNotification,
  getNotifications,
};
