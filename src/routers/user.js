const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require("../emails/account");
const router = new express.Router();

/**
 * @swagger
 * definitions:
 *   Credentials:
 *     type: object
 *     required:
 *       - email
 *       - password
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 *   NewUser:
 *     type: object
 *     required:
 *       - name
 *       - email
 *       - password
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *   User:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 *   Tokens:
 *     type: array
 *     items:
 *        $ref: '#definitions/Token'
 *   Token:
 *     type: object
 *     properties:
 *       token:
 *         type: string
 *   UserResponse:
 *     type: object
 *     properties:
 *       user:
 *         $ref: '#definitions/User'
 *       token:
 *         $ref: '#definitions/Token'
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: All about /users
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create User
 *     description: Use this route to signup a new user
 *     tags: [Users]
 *     requestBody:
 *       description: User object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#definitions/NewUser'
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Successfully created user
 *       400:
 *         description: Did not provide all required parameters
 */
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    //sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login User
 *     description: Use this route to login an existing user
 *     tags: [Users]
 *     requestBody:
 *       description: User credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#definitions/Credentials'
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully logged in user
 *       400:
 *         description: Incorrect username or password
 */
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).json();
  }
});

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout User
 *     description: Use this route to logout a user from the current session
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully logged out user
 *       500:
 *         description: Internal server error
 */
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => req.token !== token.token
    );
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

/**
 * @swagger
 * /users/logoutAll:
 *   post:
 *     summary: Logout All Users
 *     description: Use this route to logout a user from all sessions
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully logged out all user sessions
 *       500:
 *         description: Internal server error
 */
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (e) {
    res.send(500).send();
  }
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get User Profile
 *     description: Use this route to fetch a user's profile
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully fetched user profile
 */
router.get("/users/me", auth, async (req, res) => {
  // Fetch user's own profile
  res.send(req.user);
});

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update User Profile
 *     description: Use this route to update user's name, email or password
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     requestBody:
 *       description: User object containing updated properties
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#definitions/User'
 *     responses:
 *       200:
 *         description: Successfully updated user profile
 *       400:
 *         description: Invalid updates
 */
router.patch("/users/me", auth, async (req, res) => {
  // Check if requested updated is allowed
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates." });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete User Profile
 *     description: Use this route to delete user's profile
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully deleted user profile
 *       500:
 *         description: Internal server error
 */
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    //sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
