const TaskDb = require("../Database/TaskDb.js");
const fs = require("fs");
const path = require("path");

const createProject = async (data, file) => {
    try {
        const { name, description, deadline, created_by, status, priority, progress } = data;
        const project_image = file ? `${process.env.BASE_URL}/public/${file.filename}` : null;

        return await TaskDb.one(
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
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAllProjects = async () => {
    try {
        return await TaskDb.any(
            `SELECT p.id, p.name, p.description, p.deadline, p.status, p.priority, p.progress, p.project_image, p.created_at, p.updated_at, 
                    u.id AS creator_id, u.name AS creator_name, u.email AS creator_email, u.role AS creator_role, u.profile_image AS creator_profile_image
             FROM projects p
             LEFT JOIN users u ON p.created_by = u.id`
        );
    } catch (error) {
        throw new Error(error.message);
    }
};

const getSingleProject = async (id) => {
    try {
        return await TaskDb.oneOrNone(
            `SELECT p.id, p.name, p.description, p.deadline, p.status, p.priority, p.progress, p.project_image, p.created_at, p.updated_at,
                    u.id AS creator_id, u.name AS creator_name, u.email AS creator_email, u.role AS creator_role, u.profile_image AS creator_profile_image
             FROM projects p
             LEFT JOIN users u ON p.created_by = u.id
             WHERE p.id = $1`,
            [id]
        );
    } catch (error) {
        throw new Error(error.message);
    }
};

const deleteProject = async (id) => {
    try {
        const deletedProject = await TaskDb.result(
            `DELETE FROM projects WHERE id = $1 RETURNING *`,
            [id]
        );

        return deletedProject.rowCount > 0;
    } catch (error) {
        throw new Error(error.message);
    }
};

const updateProject = async (id, data, file) => {
    try {
        const { name, description, deadline, status, priority, progress } = data;
        let project_image = file ? `${process.env.BASE_URL}/public/${file.filename}` : null;

        const currentProject = await TaskDb.oneOrNone(`SELECT project_image FROM projects WHERE id = $1`, [id]);

        if (!currentProject) throw new Error("Project not found");

        if (project_image && currentProject.project_image) {
            const oldImagePath = path.join(__dirname, "..", "public", currentProject.project_image.replace(`${process.env.BASE_URL}/public/`, ""));
            fs.access(oldImagePath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(oldImagePath, (deleteErr) => {
                        if (deleteErr) console.error("Error deleting old project image:", deleteErr);
                    });
                }
            });
        }

        let updateQuery = `UPDATE projects SET `;
        let queryParams = [];
        let setClause = [];

        if (name) { setClause.push("name = $1"); queryParams.push(name); }
        if (description) { setClause.push("description = $2"); queryParams.push(description); }
        if (deadline) { setClause.push("deadline = $3"); queryParams.push(deadline); }
        if (status) { setClause.push("status = $4"); queryParams.push(status); }
        if (priority) { setClause.push("priority = $5"); queryParams.push(priority); }
        if (progress) { setClause.push("progress = $6"); queryParams.push(progress); }
        if (project_image) { setClause.push("project_image = $" + (setClause.length + 1)); queryParams.push(project_image); }

        updateQuery += setClause.join(", ") + ` WHERE id = $${queryParams.length + 1} RETURNING *`;
        queryParams.push(id);

        return await TaskDb.one(updateQuery, queryParams);
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getSingleProject,
    deleteProject,
    updateProject
};
