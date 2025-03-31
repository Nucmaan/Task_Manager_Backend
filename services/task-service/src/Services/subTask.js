const SubTask = require("../Model/subTask.js");

createSubTask = async (data, files) => {
  try {
    let fileUrls = [];

    if (files && files.length > 0) {
      fileUrls = files.map(file => `${process.env.BASE_URL}/public/${file.filename}`);
    }

    const subTask = await SubTask.create({
      ...data,
      file_url: fileUrls.length ? JSON.stringify(fileUrls) : null,
    });

    return subTask;
  } catch (error) {
    throw new Error(error.message);
  }
};

getAllSubTasks = async () => {
  return await SubTask.findAll();
};

getSubTaskById = async (id) => {
  return await SubTask.findByPk(id);
};

updateSubTask = async (id, data, files) => {
  try {
    const subTask = await SubTask.findByPk(id);
    if (!subTask) throw new Error("SubTask not found");

    let fileUrls = [];

    if (files && files.length > 0) {
      fileUrls = files.map(file => `${process.env.BASE_URL}/public/${file.filename}`);
    }

    let updatedData = {
      ...data,
      file_url: fileUrls.length ? JSON.stringify(fileUrls) : subTask.file_url,
    };

    await subTask.update(updatedData);
    return subTask;
  } catch (error) {
    throw new Error(error.message);
  }
};

deleteSubTask = async (id) => {
  const subTask = await SubTask.findByPk(id);
  if (!subTask) throw new Error("SubTask not found");
  await subTask.destroy();
};

getSubTasksByTaskId = async (taskId) => {
    try {
        const subTasks = await SubTask.findAll({
            where: { task_id: taskId },
        });
        return subTasks;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { 
    createSubTask, 
    getAllSubTasks, 
    getSubTaskById, 
    updateSubTask, 
    deleteSubTask,
    getSubTasksByTaskId
};
