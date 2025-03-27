const mongoose = require("mongoose");

const connectDB = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URL);

    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;



