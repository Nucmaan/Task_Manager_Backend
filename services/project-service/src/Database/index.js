require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.tasks_db, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "postgres",
  logging: false, 
});

 (async () => {
  try {
    await sequelize.sync({ alter: true }); 
    console.log("Tables synchronized successfully.");
  } catch (error) {
    console.error("Error syncing tables:", error);
  }
})();

module.exports = sequelize;
