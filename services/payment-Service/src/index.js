require("dotenv").config();
const app = require("./app.js");
const sequelize = require("./config/index.js");

const PORT = process.env.PORT;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

app.get("/", (req, res) => {
  res.send("Hello World!");
});
