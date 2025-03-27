const Performance = require("../model/Performance.js");
const moment = require("moment");

exports.updatePerformance = async (userId, timeTakenInMinutes, status) => {
     let totalWorkHours = timeTakenInMinutes / 60; 

    let performance = await Performance.findOne({ userId });

    if (!performance) {
        performance = new Performance({
            userId,
            completedTasks: status === "Completed" ? 1 : 0,
            workHours: parseFloat(totalWorkHours.toFixed(2)), 
        });
    } else {
        let newWorkHours = performance.workHours + totalWorkHours;
        performance.workHours = parseFloat(newWorkHours.toFixed(2)); 
        if (status === "Completed") {
            performance.completedTasks += 1;
        }
    }

    await performance.save();
    return { message: "Performance updated successfully", performance };
};

exports.getUserPerformance = async (userId) => {
    return await Performance.findOne({ userId });
};

exports.getAllPerformance = async () => {
    return await Performance.find({});
};
