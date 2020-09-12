const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Recipe = require("./recipe");

// Define mongoose schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Not a valid email.");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length < 7) {
          throw new Error("Password must contain at least 7 characters.");
        } else if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain the word "password".');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Set up a relationship between user and recipes
userSchema.virtual("recipes", {
  ref: "Recipe",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.toJSON = function () {
  const user = this;
  // toObject() method allows us to get just the raw json data
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login.");
  }

  return user;
};

// Set up middleware
// Use pre function to do something before an event
// Pass in name of event and function to run
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    // Hash the plain text password before saving
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Cascade Delete: delete user recipes when user is removed
userSchema.pre("remove", async function (next) {
  const user = this;
  await Recipe.deleteMany({ owner: user._id });
  next();
});

// Define model
const User = mongoose.model("User", userSchema);

module.exports = User;
