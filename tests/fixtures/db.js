const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Recipe = require("../../src/models/recipe");

// Define test user
const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Theo",
  email: "theo@example.com",
  password: "Bananas567#",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

// Define test user
const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: "Cam",
  email: "cam@example.com",
  password: "Red000@!",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

// Define test recipe
const recipeOne = {
  _id: new mongoose.Types.ObjectId(),
  title: "Pesto Pasta",
  description: "Pasta with pesto",
  totalTime: 30,
  owner: userOneId,
};

// Define test recipe
const recipeTwo = {
  _id: new mongoose.Types.ObjectId(),
  title: "Grilled Cheese",
  description: "Bread and cheese fried in a pan",
  totalTime: 15,
  owner: userOneId,
};

// Define test recipe
const recipeThree = {
  _id: new mongoose.Types.ObjectId(),
  title: "Vegetable Fried Rice",
  description: "Fried rice with vegetables",
  totalTime: 30,
  owner: userTwoId,
};

const populateDatabase = async () => {
  // Delete all users and recipes in database before running tests
  await User.deleteMany();
  await Recipe.deleteMany();

  // Save test users to database
  await new User(userOne).save();
  await new User(userTwo).save();

  //Save test recipes to database
  await new Recipe(recipeOne).save();
  await new Recipe(recipeTwo).save();
  await new Recipe(recipeThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  recipeOne,
  recipeTwo,
  recipeThree,
  populateDatabase,
};
