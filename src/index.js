const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const recipeRouter = require("./routers/recipe");

const app = express();
const port = process.env.PORT;

// Configure express to automatically parse the request body
app.use(express.json());

// Register routers
app.use(userRouter);
app.use(recipeRouter);

// Register listener
app.listen(port, () => {
  console.log(`Task Manager listening on port ${port}`);
});
