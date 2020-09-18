const express = require("express");
const Recipe = require("../models/recipe");
const auth = require("../middleware/auth");
const router = new express.Router();

/**
 * @swagger
 * definitions:
 *   Recipe:
 *     type: object
 *     required:
 *       - title
 *       - description
 *       - totalTime
 *     properties:
 *       title:
 *         type: string
 *       description:
 *         type: string
 *       totalTime:
 *         type: integer
 *       ingredients:
 *         $ref: '#definitions/Ingredients'
 *       steps:
 *         $ref: '#definitions/Steps'
 *   UpdatedRecipe:
 *     type: object
 *     properties:
 *       title:
 *         type: string
 *       description:
 *         type: string
 *       totalTime:
 *         type: integer
 *       ingredients:
 *         $ref: '#definitions/Ingredients'
 *       steps:
 *         $ref: '#definitions/Steps'
 *   Ingredients:
 *     type: array
 *     items:
 *        $ref: '#definitions/Ingredient'
 *   Ingredient:
 *     type: object
 *     properties:
 *       value:
 *         type: string
 *   Steps:
 *     type: array
 *     items:
 *        $ref: '#definitions/Step'
 *   Step:
 *     type: object
 *     properties:
 *       value:
 *         type: string
 */

/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: All about /recipes
 */

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Create Recipe
 *     description: Use this route to create a new recipe
 *     security:
 *       - bearerAuth: []
 *     tags: [Recipes]
 *     requestBody:
 *       description: Recipe object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#definitions/Recipe'
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Successfully created recipe
 *       400:
 *         description: Did not provide all required parameters
 */
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

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Get User Recipes
 *     description: Use this route to fetch a user's recipes
 *     security:
 *       - bearerAuth: []
 *     tags: [Recipes]
 *     parameters:
 *       - name: title
 *         in: query
 *         description: Get recipe by title
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully fetched user recipes
 *       500:
 *         description: Internal server error
 */
// TODO: GET /recipes?ingredients[]='Rice'
// TODO: Add query string to api docs
router.get("/recipes", auth, async (req, res) => {
  // Fetch all the authenticated user's recipes from mongoDB collection
  const match = {};
  const sort = {};

  if (req.query.title) {
    match.title = req.query.title;
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

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     summary: Get User Recipe By Id
 *     description: Use this route to fetch a user's recipe by id
 *     security:
 *       - bearerAuth: []
 *     tags: [Recipes]
 *     parameters:
 *       - name: id
 *         description: Get recipe by id
 *         required: true
 *         in: path
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully fetched user recipe
 *       404:
 *         description: Recipe not found
 *       400:
 *         description: Did not provide _id
 */
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

/**
 * @swagger
 * /recipes/{id}:
 *   patch:
 *     summary: Update User Recipe
 *     description: Use this route to update user's recipe
 *     security:
 *       - bearerAuth: []
 *     tags: [Recipes]
 *     parameters:
 *       - name: id
 *         description: Update recipe by id
 *         required: true
 *         in: path
 *     produces:
 *       - application/json
 *     requestBody:
 *       description: Recipe object containing updated properties
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#definitions/UpdatedRecipe'
 *     responses:
 *       200:
 *         description: Successfully updated user recipe
 *       400:
 *         description: Invalid updates
 */
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

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: Delete User Recipe
 *     description: Use this route to delete user's recipe
 *     security:
 *       - bearerAuth: []
 *     tags: [Recipes]
 *     parameters:
 *       - name: id
 *         description: Delete recipe by id
 *         required: true
 *         in: path
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully deleted user recipe
 *       500:
 *         description: Internal server error
 */
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
