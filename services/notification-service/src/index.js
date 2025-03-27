const app = require("./app.js");

const PORT = 8004;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });