const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOneId, userOne, populateDatabase } = require("./fixtures/db");

beforeEach(populateDatabase);

test("Should signup new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Olivia",
      email: "olivia@example.com",
      password: "MyPass222!",
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: "Olivia",
      email: "olivia@example.com",
    },
    token: user.tokens[0].token,
  });

  // Assert that plain text password was not stored in database
  expect(user.password).not.toBe("MyPass222!");
});

test("Should not signup new user with invalid name", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "",
      email: "olivia@example.ca",
      password: "MyPass222!",
    })
    .expect(400);
});

test("Should not signup new user with invalid email", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Olivia",
      email: "example.ca",
      password: "MyPass222!",
    })
    .expect(400);
});

test("Should not signup new user with password containing 'password'", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "",
      email: "olivia@example.ca",
      password: "password",
    })
    .expect(400);
});

test("Should not signup new user with password less than 7 characters", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "",
      email: "olivia@example.ca",
      password: "password123",
    })
    .expect(400);
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  // Assert that token in response matches user's second token
  // We are matching the second token because the first token was created when the user signed up
  const user = await User.findById(response.body.user._id);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login non-existent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "theo@example.ca",
      password: userOne.password,
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for user", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that the user was removed from the database
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should update valid user fields", async () => {
  const response = await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Olivia Tinios",
    })
    .expect(200);

  // Assert that the data in the database reflects the changes made
  const user = await User.findById(userOneId);
  expect(user).toMatchObject({
    name: "Olivia Tinios",
  });
});

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      age: 22,
    })
    .expect(400);
});

test("Should not update user with invalid email", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      email: "example.com",
    })
    .expect(400);
});

test("Should not update user with password containing 'password'", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      password: "password123",
    })
    .expect(400);
});

test("Should not update user with password less than 7 characters", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      password: "123",
    })
    .expect(400);
});

test("Should not update unauthenticated user", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      name: "Olivia Tinios",
    })
    .expect(401);
});
