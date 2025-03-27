const mongoose = require("mongoose");
const axios = require("axios"); 

const messageSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String },
    senderProfileImage: { type: String },
    message: { type: String },
    file: { type: String },
  },
  { timestamps: true }
);

messageSchema.pre("save", async function (next) {
  try {
    const projectId = this.projectId;
    const senderId = this.senderId;

     const projectResponse = await axios.get(`http://localhost:8002/api/project/singleProject/${projectId}`);
    if (!projectResponse.data.project) {
      console.log("Project does NOT exist, but storing message anyway.");
    }

     const userResponse = await axios.get(`http://localhost:8001/api/auth/users/${senderId}`);
    if (userResponse.data.user) {
      this.senderName = userResponse.data.user.name;
      this.senderProfileImage = userResponse.data.user.profile_image;
    }

    next();
  } catch (error) {
    console.error("Error fetching details:", error.response?.data || error.message);
    next(); 
  }
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
