const mongoose = require("mongoose");

const PerformanceSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  completedTasks: {
    type: Number,
    default: 0,
  },
  workHours: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Performance", PerformanceSchema);
