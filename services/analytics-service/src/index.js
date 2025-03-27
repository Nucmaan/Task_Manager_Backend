require("dotenv").config();
const app = require("./app.js");
const connectDB = require("./config/db.js");

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});
