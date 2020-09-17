const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");

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

const populateDatabase = async () => {
  // Delete all users in database before running tests
  await User.deleteMany();

  // Save test user to database
  await new User(userOne).save();
};

module.exports = {
  userOneId,
  userOne,
  populateDatabase,
};
