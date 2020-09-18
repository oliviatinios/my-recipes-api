const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const recipeRouter = require("./routers/recipe");

const app = express();

// Configure swagger api documentation
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.3",
    info: {
      title: "My Recipes API",
      version: "1.0.0",
      description:
        "To get started, create a new user. You can then use the token from the response object to authorize other requests.",
      servers: ["http://localhost:3000"],
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routers/*"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Configure express to automatically parse the request body
app.use(express.json());

// Register routers
app.use(userRouter);
app.use(recipeRouter);

module.exports = app;
