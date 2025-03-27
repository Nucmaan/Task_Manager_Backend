const TaskDb = require("../Database/TaskDb.js");
const fs = require("fs");
const path = require("path");

const TaskAssignment = require("../Model/task_assignments.js");
const Task = require("../Model/TasksModel.js");
const TaskStatusUpdate = require("../Model/task_status_updates.js");  
const axios = require("axios");
const redis = require("../utills/redis.js");

 const getUserFromService = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8001/api/auth/users/${userId}`);
      return response.data.user; 
    } catch (error) {
      console.error("Error fetching user:", error.message);
      return null;
    }
  };
  
  const createAssignment = async (taskId, userId) => {
    try {
       const task = await Task.findByPk(taskId);
      if (!task) throw new Error('Task not found');
  
       const user = await getUserFromService(userId);
      if (!user) throw new Error('User not found');
  
       const newAssignment = await TaskAssignment.create({
        task_id: taskId,
        user_id: userId,
      });
  
       const newStatusUpdate = await TaskStatusUpdate.create({
        task_id: taskId,
        updated_by: userId,
        status: 'To Do',
      });
  
      return { newAssignment, newStatusUpdate };
    } catch (error) {
      console.error("Error creating task assignment:", error.message);
      throw error; 
    }
  };

  const getUserStatusUpdates = async (userId) => {
    try {
      const user = await getUserFromService(userId);
      if (!user) throw new Error("User not found");
  
      const statusUpdates = await TaskStatusUpdate.findAll({
        where: { updated_by: userId },
        include: [
          {
            model: Task,
        attributes: ["title", "description", "deadline", "priority", "status", "createdAt"],
          },
        ],
        order: [["updated_at", "DESC"]],
      });
  
      return statusUpdates;
    } catch (error) {
      console.error("Error fetching user status updates:", error.message);
      throw error;
    }
  };


  const getAllStatusUpdates = async () => {
    try {
        const statusUpdates = await TaskStatusUpdate.findAll({
            include: [
                {
                    model: Task,
                    attributes: ["title", "description", "status", "deadline", "priority"],
                },
            ],
            order: [["updatedAt", "DESC"]],
            raw: true,  // ✅ Ensure Sequelize returns plain objects
        });

        // Fetch user details for each update
        const updatedStatus = await Promise.all(
            statusUpdates.map(async (update) => {
                const user = await getUserFromService(update.updated_by);
                return {
                    ...update,  // ✅ Now it includes `time_taken_in_hours`
                    assigned_user: user ? user.name : "Unknown User",
                    profile_image: user ? user.profile_image : null,
                };
            })
        );

        return updatedStatus;
    } catch (error) {
        console.error("Error fetching all status updates:", error.message);
        throw error;
    }
};

  const getUserAssignments = async (userId) => {
    try {

        const user = await getUserFromService(userId);
      if (!user) throw new Error("User not found");
  
      const assignments = await TaskAssignment.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Task,
            attributes: [
              "id",
              "title",
              "description",
              "status",
              "priority",
              "deadline",
              "estimated_hours",
              "file_url",
              "createdAt",
              "updatedAt",
            ],
          },
        ],
      });
  
      return assignments.map((assignment) => assignment.Task); 
    } catch (error) {
      console.error("Error fetching user assignments:", error.message);
      throw error;
    }
  };

  const submitTask = async (taskId, updatedBy, status, file) => {
    if (!file) throw new Error("File is required");
    if (!status) throw new Error("Status is required");

    const allowedStatuses = ["To Do", "In Progress", "Review", "Completed"];
    if (!allowedStatuses.includes(status)) throw new Error("Invalid status");

    const task = await Task.findByPk(taskId);
    if (!task) throw new Error("Task not found");

    const user = await getUserFromService(updatedBy);
    if (!user) throw new Error("User not found");

    const file_url = `${process.env.BASE_URL}/public/${file.filename}`;

    if (task.file_url) {
        const oldFilePath = path.join(
            __dirname,
            "..",
            "public",
            task.file_url.replace(`${process.env.BASE_URL}/public/`, "")
        );
        fs.unlink(oldFilePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });
    }

    await task.update({
        status: status,
        file_url: file_url,
        updatedAt: new Date(),
    });

     let lastUpdate = await TaskStatusUpdate.findOne({
        where: { task_id: taskId },
        order: [["updated_at", "DESC"]], 
    });

    let timeTakenInHours = null;
    let timeTakenInMinutes = null;

    if (lastUpdate) {
         const timeDifference = new Date() - new Date(lastUpdate.updated_at);

         timeTakenInMinutes = Math.floor(timeDifference / (1000 * 60));
        timeTakenInHours = Math.floor(timeTakenInMinutes / 60);
        timeTakenInMinutes = timeTakenInMinutes % 60;
    }

    let updatedStatus = await TaskStatusUpdate.create({
        task_id: taskId,
        updated_by: updatedBy,
        status: status,
        updated_at: new Date(),
        time_taken_in_hours: timeTakenInHours, 
        time_taken_in_minutes: timeTakenInMinutes, 
    });


     try {
      await axios.post("http://localhost:8007/api/performance/track", {
          userId: updatedBy,
          timeTakenInMinutes: timeTakenInMinutes,
          status: status,
      });
      console.log("Performance updated successfully");
  } catch (error) {
      console.error("Error updating performance:", error.response?.data || error.message);
  }


    return {
        success: true,
        message: "Task updated successfully",
        task,
        taskStatusUpdate: updatedStatus,
    };
};


const updateAssignment = async (taskId, oldUserId, newUserId) => {

   const user = await getUserFromService(newUserId);
  if (!user) throw new Error("New user not found");

   const assignment = await TaskAssignment.findOne({
      where: { task_id: taskId, user_id: oldUserId },
  });

  if (!assignment) throw new Error("Assignment not found");

   await assignment.update({ user_id: newUserId });

   const newStatusUpdate = await TaskStatusUpdate.create({
      task_id: taskId,
      updated_by: newUserId,
      status: "To Do",
  });

  return { assignment, newStatusUpdate };
};

const editStatusUpdate = async (statusUpdateId, status) => {
  try {
     const allowedStatuses = ["To Do", "In Progress", "Review", "Completed"];
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

     const statusUpdate = await TaskStatusUpdate.findByPk(statusUpdateId);
    if (!statusUpdate) {
      throw new Error("Status update not found");
    }

     await statusUpdate.update({
      status,
      updated_at: new Date(),
    });

    return statusUpdate;
  } catch (error) {
    console.error("Error updating task status:", error.message);
    throw error;
  }
};


module.exports = {
    createAssignment,
    updateAssignment,
    getUserAssignments,
    editStatusUpdate,
    getUserStatusUpdates,
    getAllStatusUpdates,
    submitTask
};