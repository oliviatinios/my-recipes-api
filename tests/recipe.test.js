const request = require("supertest");
const app = require("../src/app");
const Recipe = require("../src/models/recipe");
const {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  recipeOne,
  populateDatabase,
} = require("./fixtures/db");

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

test("Should get all recipes for user", async () => {
  const response = await request(app)
    .get("/recipes")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that user one has two recipes
  expect(response.body.length).toBe(2);
});

test("Should not delete task not owned by user", async () => {
  const response = await request(app)
    .delete(`/recipes/${recipeOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  // Assert that recipe one still exists in database
  const recipe = await Recipe.findById(recipeOne._id);
  expect(recipe).not.toBeNull();
});
