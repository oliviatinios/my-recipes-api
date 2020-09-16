const app = require("./app");
const port = process.env.PORT;

// Register listener
app.listen(port, () => {
  console.log(`Task Manager listening on port ${port}`);
});
