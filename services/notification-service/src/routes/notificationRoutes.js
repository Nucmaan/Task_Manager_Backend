const express = require("express");
const { createNotification, createScheduledNotification, getNotifications } = require("../Controllers/notificationController");

const router = express.Router();

router.post("/create",createNotification); 
router.post("/schedule",createScheduledNotification); 
router.get("/:userId",getNotifications);

module.exports = router;
