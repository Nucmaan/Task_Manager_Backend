require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.taskDb_Name, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false, 
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection successful!");
    return sequelize.sync({ force: false }); // Ensure tables are created
  })
  .then(() => {
    console.log("Tables synchronized successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });


  module.exports = sequelize;

