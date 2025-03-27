const performanceService = require("../service/performanceService.js");

exports.trackPerformance = async (req, res) => {
    try {
        const { userId, timeTakenInMinutes, status } = req.body;
        
        if (!userId || !timeTakenInMinutes || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await performanceService.updatePerformance(userId, timeTakenInMinutes, status);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getPerformance = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const performance = await performanceService.getUserPerformance(userId);
        if (!performance) {
            return res.status(404).json({ message: "Performance record not found" });
        }

        return res.status(200).json(performance);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getAllPerformance = async (req, res) => {
    try {
        const performance = await performanceService.getAllPerformance();
        if (!performance.length > 0) {
            return res.status(404).json({ message: "Performance record not found" });
        }
        return res.status(200).json(performance);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
