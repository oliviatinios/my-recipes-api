const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const recipeSchema = new mongoose.Schema(
  {
    // TODO: enforce a maximum length for the title
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // TODO: break this up into prepTime and cookTime
    totalTime: {
      type: Number,
      required: true,
      validate(value) {
        if (value < 0) {
          throw new Error("Time must be a positive number.");
        }
      },
    },
    ingredients: [
      {
        ingredient: {
          type: String,
        },
      },
    ],
    steps: [
      {
        step: {
          type: String,
        },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectID,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
