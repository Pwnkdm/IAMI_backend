const express = require("express");
const User = require("../Models/User.js");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser.js");

// Initialize dotenv to use environment variables

const router = express.Router();

// Create user route
router.post(
  "/createuser",
  [
    body("name", "Name should be at least 3 characters long").isLength({
      min: 3,
    }),
    body("password", "Password should be at least 5 characters long").isLength({
      min: 5,
    }),
    body("email", "Invalid email").isEmail(),
    body(
      "role",
      "Role is required and should be either 'customer' or 'agent'"
    ).isIn(["customer", "agent"]),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      // Check if user already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success = false;
        return res.status(400).json({ success, error: "Email already exists" });
      }

      // Generate salt and hashed password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create new user with role
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
        role: req.body.role, // Ensure role is saved
      });

      // Generate JWT token
      const data = {
        user: {
          id: user.id,
        },
      };
      const JWT_SECRET = "vaibhav"; // Should be stored securely in env variables
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      success = false;
      console.error(error.message);
      res.status(500).send("Internal Server Error"); // Send a response in case of error
    }
  }
);

// User login route
router.post(
  "/login",
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Invalid email or password" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Invalid email or password" });
      }

      // Generate JWT token
      const data = {
        user: {
          id: user.id,
        },
      };
      const JWT_SECRET = "vaibhav"; // Should be stored securely in env variables
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error"); // Send a response in case of error
    }
  }
);

// Route to get user details (after login)
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password"); // Exclude password
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error"); // Send a response in case of error
  }
});

// Route to update name and password using email as identifier
router.put(
  "/updateuser",
  fetchuser,
  [
    body("email", "Please provide a valid email").isEmail(),
    body("name", "Name should be at least 3 characters long")
      .optional()
      .isLength({ min: 3 }),
    body("password", "Password should be at least 5 characters long")
      .optional()
      .isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, name, password } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      // Update fields only if they are provided
      if (name) user.name = name;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      // Save updated user
      await user.save();

      res.json({
        success: true,
        message: "User updated successfully",
        user: { name: user.name, email: user.email },
      });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

module.exports = router;
