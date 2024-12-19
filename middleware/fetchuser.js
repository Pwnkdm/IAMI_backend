const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // process.env.JWT_SECRET should be set in your environment variables
    req.user = decoded.user;
    next(); // Move to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
    console.log("0123", err);
  }
};
