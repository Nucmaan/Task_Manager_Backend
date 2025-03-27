require("dotenv").config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize( process.env.userDb_Name, 
    process.env.DB_USER,     
    process.env.DB_PASS,
     {
        host: process.env.DB_HOST, 
        dialect: "postgres",       
        logging: false, 
  }
);

 module.exports = sequelize;
