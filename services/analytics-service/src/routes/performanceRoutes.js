const express = require("express");
const { trackPerformance, getPerformance, getAllPerformance } = require("../controller/performanceController.js");

const router = express.Router();

router.post("/track", trackPerformance);
router.get("/performances", getAllPerformance);
router.get("/:userId", getPerformance); 

module.exports = router;
