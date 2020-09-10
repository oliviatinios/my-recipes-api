const express = require("express");
const Recipe = require("../models/recipe");
const auth = require("../middleware/auth");
const router = new express.Router();

// POST /recipes
router.post("/recipes", auth, async (req, res) => {
  const recipe = new Recipe({
    ...req.body,
    owner: req.user._id,
  });

  // Save recipe to mongoDB collection using mongoose
  try {
    await recipe.save();
    res.status(201).send(recipe);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET /recipes?completed=false
// GET /recipes?limit=10&skip=10
// GET /recipes?sortBy=createdAt_desc
router.get("/recipes", auth, async (req, res) => {
  // Fetch all the authenticated user's recipes from mongoDB collection
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
  }

  try {
    await req.user
      .populate({
        path: "recipes",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.recipes);
  } catch (e) {
    res.status(500).send();
  }
});

// GET /recipes/:id
router.get("/recipes/:id", auth, async (req, res) => {
  const _id = req.params.id;

  // Fetch recipe by id from mongoDB collection
  try {
    const recipe = await Recipe.findOne({ _id, owner: req.user._id });

    if (!recipe) {
      return res.status(404).send();
    }

    res.send(recipe);
  } catch (e) {
    res.status(400).send(e);
  }
});

// PATCH /recipes/:id
router.patch("/recipes/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "title",
    "description",
    "totalTime",
    "ingredients",
    "steps",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates." });
  }

  try {
    const _id = req.params.id;
    const recipe = await Recipe.findOne({ _id, owner: req.user._id });

    if (!recipe) {
      return res.status(404).send();
    }

    updates.forEach((update) => (recipe[update] = req.body[update]));
    await recipe.save();

    res.send(recipe);
  } catch (e) {
    res.status(400).send(e);
  }
});

// DELETE /recipes/:id
router.delete("/recipes/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const deletedRecipe = await Recipe.findOneAndDelete({
      _id,
      owner: req.user.id,
    });

    if (!deletedRecipe) {
      return res.status(404).send();
    }

    res.send(deletedRecipe);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
