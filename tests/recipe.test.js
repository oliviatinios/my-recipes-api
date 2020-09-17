const request = require("supertest");
const app = require("../src/app");
const Recipe = require("../src/models/recipe");
const { userOneId, userOne, populateDatabase } = require("./fixtures/db");

beforeEach(populateDatabase);

test("Should create recipe for user", async () => {
  const response = await request(app)
    .post("/recipes")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      title: "Burrito Bowl",
      description: "Burrito in a bowl",
      totalTime: 60,
    })
    .expect(201);

  // Assert that the database was changed correctly
  const recipe = await Recipe.findById(response.body._id);
  expect(recipe).not.toBeNull();
});
