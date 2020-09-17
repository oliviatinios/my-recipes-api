const request = require("supertest");
const app = require("../src/app");
const Recipe = require("../src/models/recipe");
const {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  recipeOne,
  recipeTwo,
  recipeThree,
  populateDatabase,
} = require("./fixtures/db");
const { send } = require("./_mocks_/@sendgrid/mail");

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

test("Should not create recipe with invalid title", async () => {
  const response = await request(app)
    .post("/recipes")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      title: "",
      description: "Burrito in a bowl",
      totalTime: 60,
    })
    .expect(400);
});

test("Should not create recipe with invalid description", async () => {
  const response = await request(app)
    .post("/recipes")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      title: "Burrito Bowl",
      description: "",
      totalTime: 60,
    })
    .expect(400);
});

test("Should not create recipe with invalid totalTime", async () => {
  const response = await request(app)
    .post("/recipes")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      title: "Burrito Bowl",
      description: "Burrito in a bowl",
    })
    .expect(400);
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

test("Should not get all recipes for unauthenticated user", async () => {
  const response = await request(app).get("/recipes").send().expect(401);
});

test("Should get recipe by id if owned by user", async () => {
  const response = await request(app)
    .get(`/recipes/${recipeOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that the recipe in the response body is correct
  expect(response.body).toMatchObject({
    title: recipeOne.title,
    description: recipeOne.description,
    totalTime: recipeOne.totalTime,
  });
});

test("Should not get recipe by id if not owned by user", async () => {
  const response = await request(app)
    .get(`/recipes/${recipeOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
});

test("Should not get recipe by id for unauthenticated user", async () => {
  const response = await request(app)
    .get(`/recipes/${recipeOne._id}`)
    .send()
    .expect(401);
});

test("Should update recipe if owned by user", async () => {
  const response = await request(app)
    .patch(`/recipes/${recipeTwo._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      title: "Creamy Pesto Pasta",
      description: "Pasta with creamy pesto sauce",
      totalTime: 45,
    })
    .expect(200);

  // Assert that the data was updated correctly in the database
  const recipe = await Recipe.findById(recipeTwo._id);
  expect(recipe).toMatchObject({
    title: "Creamy Pesto Pasta",
    description: "Pasta with creamy pesto sauce",
    totalTime: 45,
  });
});

test("Should not update recipe if not owned by user", async () => {
  const response = await request(app)
    .patch(`/recipes/${recipeTwo._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send({
      title: "Creamy Pesto Pasta",
      description: "Pasta with creamy pesto sauce",
      totalTime: 45,
    })
    .expect(404);
});

test("Should not update recipe for unauthenticated user", async () => {
  const response = await request(app)
    .patch(`/recipes/${recipeTwo._id}`)
    .send({
      title: "Creamy Pesto Pasta",
      description: "Pasta with creamy pesto sauce",
      totalTime: 45,
    })
    .expect(401);
});

test("Should delete recipe owned by user", async () => {
  const response = await request(app)
    .delete(`/recipes/${recipeThree._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that recipe three is not in database
  const recipe = await Recipe.findById(recipeThree._id);
  expect(recipe).toBeNull();
});

test("Should not delete recipe not owned by user", async () => {
  const response = await request(app)
    .delete(`/recipes/${recipeOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  // Assert that recipe one still exists in database
  const recipe = await Recipe.findById(recipeOne._id);
  expect(recipe).not.toBeNull();
});

test("Should not delete recipe for unauthenticated user", async () => {
  const response = await request(app)
    .delete(`/recipes/${recipeOne._id}`)
    .send()
    .expect(401);

  // Assert that recipe one still exists in database
  const recipe = await Recipe.findById(recipeOne._id);
  expect(recipe).not.toBeNull();
});
