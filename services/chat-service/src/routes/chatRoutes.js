const express = require("express");
const { sendMessage, getMessages } = require("../Controllers/chatController.js");
const { upload } = require('../middleware/uploadMiddleware.js');

const router = express.Router();

router.post("/send", upload.single('file'),sendMessage);
router.get("/:projectId", getMessages);

module.exports = router;

