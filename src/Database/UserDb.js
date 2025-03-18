const pgp = require("pg-promise")();
require("dotenv").config();

const UserDb = pgp({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.userDb_Name,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

module.exports = UserDb;
