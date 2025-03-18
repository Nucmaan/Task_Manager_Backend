const db = require("../Database/database.js");
const fs = require("fs");
const path = require("path");

const createProject = async (req, res) => {
    try {
        const { name, description, deadline, created_by, status, priority, progress } = req.body;
        //const project_image = req.file ? req.file.path : null;
        const project_image = req.file ? `${process.env.BASE_URL}/public/${req.file.filename}` : null;

        const project = await db.one(
            `INSERT INTO projects (name, description, deadline, created_by, status, project_image, priority, progress) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
                name, 
                description, 
                deadline, 
                created_by, 
                status || "Pending", 
                project_image, 
                priority || "Medium",   
                progress || 0           
            ]
        );

        res.status(201).json({ success: true, message: "Project created successfully", project });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating project", error: error.message });
    }
};

const getAllProjects = async (req, res) => {
    try {
        const projects = await db.any(
            `SELECT p.id, p.name, p.description, p.deadline, p.status, p.priority, p.progress, p.project_image, p.created_at, p.updated_at, 
                    u.id AS creator_id, u.name AS creator_name, u.email AS creator_email, u.role AS creator_role, u.profile_image AS creator_profile_image
             FROM projects p
             LEFT JOIN users u ON p.created_by = u.id`
        );
        res.status(201).json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching projects", error: error.message });
    }
};

const getSingleProject = async (req, res) => {
    try {
        const { id } = req.params; 

        const project = await db.oneOrNone(
            `SELECT p.id, p.name, p.description, p.deadline, p.status, p.priority, p.progress, p.project_image, p.created_at, p.updated_at,
                    u.id AS creator_id, u.name AS creator_name, u.email AS creator_email, u.role AS creator_role, u.profile_image AS creator_profile_image
             FROM projects p
             LEFT JOIN users u ON p.created_by = u.id
             WHERE p.id = $1`,
            [id]
        );

        if (project) {
            res.status(200).json({ success: true, project });
        } else {
            res.status(404).json({ success: false, message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching project", error: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { id } = req.params; 

        const deletedProject = await db.result(
            `DELETE FROM projects WHERE id = $1 RETURNING *`,
            [id]
        );

        if (deletedProject.rowCount > 0) {
            res.status(200).json({ success: true, message: "Project deleted successfully" });
        } else {
            res.status(404).json({ success: false, message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting project", error: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, deadline, status, priority, progress } = req.body;
        
        let project_image = null;

        if (req.file) {
            project_image = `${process.env.BASE_URL}/public/${req.file.filename}`;
        }

         const currentProject = await db.oneOrNone(
            `SELECT project_image FROM projects WHERE id = $1`,
            [id]
        );

        if (!currentProject) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

         if (project_image && currentProject.project_image) {
            const oldImagePath = path.join(__dirname, "..", "public", currentProject.project_image.replace(`${process.env.BASE_URL}/public/`, ""));
            fs.access(oldImagePath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(oldImagePath, (deleteErr) => {
                        if (deleteErr) {
                            console.error("Error deleting old project image:", deleteErr);
                        }
                    });
                }
            });
        }

         let updateQuery = `UPDATE projects SET `;
        let queryParams = [];
        let setClause = [];

         if (name) {
            setClause.push("name = $1");
            queryParams.push(name);
        }
        if (description) {
            setClause.push("description = $2");
            queryParams.push(description);
        }
        if (deadline) {
            setClause.push("deadline = $3");
            queryParams.push(deadline);
        }
        if (status) {
            setClause.push("status = $4");
            queryParams.push(status);
        }
        if (priority) {
            setClause.push("priority = $5");
            queryParams.push(priority);
        }
        if (progress) {
            setClause.push("progress = $6");
            queryParams.push(progress);
        }
        if (project_image) {
            setClause.push("project_image = $" + (setClause.length + 1)); 
            queryParams.push(project_image);
        }

         updateQuery += setClause.join(", ") + ` WHERE id = $${queryParams.length + 1} RETURNING *`;
        queryParams.push(id);

         const updatedProject = await db.one(updateQuery, queryParams);

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project: updatedProject,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating project", error: error.message });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getSingleProject,
    deleteProject,
    updateProject
};
