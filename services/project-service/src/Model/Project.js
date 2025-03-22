const { DataTypes } = require("sequelize");
const projectInstance = require("../Database/index.js");
const usersDb = require("../../../user-service/src/Database/index.js");


const Project = projectInstance.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    project_image: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    deadline: {
      type: DataTypes.DATEONLY,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "Pending",
      validate: {
        isIn: [["Pending", "In Progress", "Completed"]],
      },
    },
    priority: {
      type: DataTypes.STRING(20),
      defaultValue: "Medium",
      validate: {
        isIn: [["Low", "Medium", "High", "Critical"]],
      },
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "projects",
    timestamps: false,
  }
);

Project.prototype.getCreator = async function () {
  try {
    const user = await usersDb.query("SELECT * FROM users WHERE id = ?", {
      replacements: [this.created_by],
      type: usersDb.QueryTypes.SELECT,
    });
    return user[0]; 
  } catch (error) {
    console.error("Error fetching creator:", error);
    return null; 
  }
};

module.exports = Project;
