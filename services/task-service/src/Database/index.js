require("dotenv").config();

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.taskDb_Name, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "postgres",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log("Connected to PostgreSQL - Task Service"))
  .catch((err) => console.error("Unable to connect:", err));

module.exports = sequelize;


