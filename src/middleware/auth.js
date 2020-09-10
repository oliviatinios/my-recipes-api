const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    // Get auth token from request header
    const token = req.header("Authorization").replace("Bearer ", "");
    // Validate auth token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find associated user
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    // If user is authenticated, proceed with route handler
    next();
  } catch (e) {
    // Send error if user is not authenticated
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
