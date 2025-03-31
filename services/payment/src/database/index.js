require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.userDb_Name, 
  process.env.DB_USER,     
  process.env.DB_PASS,     
  {
    host: process.env.DB_HOST, 
    dialect: "postgres",       
    logging: false,            
  }
);

(async () => {
  try {
    await sequelize.authenticate(); 
    console.log("Database connected successfully.");
    await sequelize.sync({ alter: true }); 
    console.log("Tables synchronized successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
})();

module.exports = sequelize;


