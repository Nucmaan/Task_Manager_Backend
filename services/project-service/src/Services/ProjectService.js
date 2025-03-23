const fs = require("fs");
const path = require("path");
const Project = require("../Model/Project.js");
const User = require("../../../user-service/src/model/User.js");
const axios = require("axios");
const { Op } = require('sequelize');

const redis = require('../utills/redis.js');

const getUserFromService = async (userId) => {
  try {
    const response = await axios.get(
      `http://localhost:8001/api/auth/users/${userId}`
    );
    return response.data.user; 
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }
};

const createProject = async (data, file) => {
  try {
    const {
      name,
      description,
      deadline,
      created_by,
      status,
      priority,
      progress, 
    } = data;

    if (!name || !description || !deadline || !created_by) {
      throw new Error("Missing required fields: name, description, deadline, or created_by");
    }

    if (isNaN(created_by)) {
      throw new Error("Invalid user ID (created_by). It should be a number.");
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      throw new Error("Invalid deadline. It should be a valid date.");
    }

    const validStatuses = ["Pending", "In Progress", "Completed", "On Hold"];
    if (status && !validStatuses.includes(status)) {
      throw new Error(`Invalid status. Valid options are: ${validStatuses.join(", ")}`);
    }

    const validPriorities = ["High", "Medium", "Low"];
    if (priority && !validPriorities.includes(priority)) {
      throw new Error(`Invalid priority. Valid options are: ${validPriorities.join(", ")}`);
    }

    let projectProgress = Number(progress);
    if (progress !== undefined && (isNaN(projectProgress) || projectProgress < 0 || projectProgress > 100)) {
      throw new Error("Invalid progress. It should be a number between 0 and 100.");
    }

    console.log("Creating project with user ID:", created_by);
    const user = await getUserFromService(created_by);
    if (!user) {
      throw new Error("User not found");
    }

    const project_image = file ? `${process.env.BASE_URL}/public/${file.filename}` : null;

    const newProject = await Project.create({
      name,
      description,
      deadline: parsedDeadline,
      created_by,
      status: status || "Pending",
      project_image,
      priority: priority || "Medium",
      progress: projectProgress || 0, 
    });

    await redis.del('projects'); 

    return newProject;

  } catch (error) {
    console.error("Error:", error.message);
    throw new Error(error.message);
  }
};

  const getAllProjects = async () => {
    try {

      const cachedProjects = await redis.get('projects');
      if (cachedProjects) {
        console.log('Returning cached projects from Redis');
        return JSON.parse(cachedProjects);
      }

      const projects = await Project.findAll({
        attributes: [
          'id', 'name', 'description', 'deadline', 'status', 'priority', 'progress', 'project_image', 'created_at', 'updated_at', 'created_by'
        ],
      });
  
      const projectsWithUserInfo = await Promise.all(
        projects.map(async (project) => {
          try {
            const user = await getUserFromService(project.created_by);
  
            if (!user) {
              throw new Error("User not found");
            }
  
            return {
              ...project.toJSON(),
              creator_id: user.id,
              creator_name: user.name,
              creator_email: user.email,
              creator_role: user.role,
              creator_profile_image: user.profile_image,
            };

          } catch (userError) {
            console.error("Error fetching user data:", userError.message);
            return {
              ...project.toJSON(),
              creator_id: null,
              creator_name: "Unknown",
              creator_email: "Unknown",
              creator_role: "Unknown",
              creator_profile_image: null,
            };
          }
        })
      );
      await redis.set('projects', JSON.stringify(projectsWithUserInfo)); 
      return projectsWithUserInfo;
    } catch (error) {
      console.error("Error fetching projects:", error.message);
      throw new Error(error.message);
    }
  };

  const getSingleProject = async (id) => {
    try {

      const cachedProject = await redis.get(`project:${id}`);
      if (cachedProject) {
        console.log('Returning cached project from Redis');
        return JSON.parse(cachedProject);
      }

      const project = await Project.findOne({
        where: { id },
        attributes: [
          'id', 'name', 'description', 'deadline', 'status', 'priority', 'progress', 'project_image', 'created_at', 'updated_at', 'created_by'
        ]
      });
  
      if (!project) {
        throw new Error("Project not found");
      }
  
      const user = await getUserFromService(project.created_by);
  
      if (!user) {
        throw new Error("User not found");
      }
  
      const projectWithUserInfo = {
        ...project.toJSON(),
        creator_id: user.id,
        creator_name: user.name,
        creator_email: user.email,
        creator_role: user.role,
        creator_profile_image: user.profile_image,
      };
       await redis.set(`project:${id}`, JSON.stringify(projectWithUserInfo)); 
      return projectWithUserInfo;
    } catch (error) {
      console.error("Error fetching single project with user:", error.message);
      throw new Error(error.message);
    }
  };

  const deleteProject = async (id) => {
    try {
      const deletedCount = await Project.destroy({
        where: { id }, 
      });
       if (deletedCount > 0) {
         await redis.del(`project:${id}`);
         await redis.del('projects');
      }
  
      return deletedCount > 0;
    } catch (error) {
      console.error("Error deleting project:", error.message);
      throw new Error(error.message);
    }
  };

  const updateProject = async (id, data, file) => {
    try {
      const { name, description, deadline, status, priority, progress } = data;
  
      let project_image = file
        ? `${process.env.BASE_URL}/public/${file.filename}`
        : null;
  
       const currentProject = await Project.findOne({ where: { id } });
  
      if (!currentProject) {
        throw new Error("Project not found");
      }
  
       if (project_image && currentProject.project_image) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          "public",
          currentProject.project_image.replace(
            `${process.env.BASE_URL}/public/`,
            ""
          )
        );
  
        fs.access(oldImagePath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(oldImagePath, (deleteErr) => {
              if (deleteErr)
                console.error("Error deleting old project image:", deleteErr);
            });
          }
        });
      }
  
       const updatedFields = {
        name: name || currentProject.name,
        description: description || currentProject.description,
        deadline: deadline || currentProject.deadline,
        status: status || currentProject.status,
        priority: priority || currentProject.priority,
        progress: progress || currentProject.progress,
        project_image: project_image || currentProject.project_image,
      };
  
       await Project.update(updatedFields, {
        where: { id },
      });
  
       const updatedProject = await Project.findOne({ where: { id } });

       await redis.del(`project:${id}`);
       await redis.del('projects');
  
      return updatedProject;
  
    } catch (error) {
      console.error("Error updating project:", error.message);
      throw new Error(error.message);
    }
  };

module.exports = {
  createProject,
  getAllProjects,
  getSingleProject,
  deleteProject,
  updateProject,
};
