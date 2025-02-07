const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );
    
    res.status(201).json({ token, user: { id: user._id, name, email } });
    console.log("user registered suceesfully !token",token,"user",user);
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
    console.log("user logged in suceesfully !token",token,"user",user);
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// Guest login
router.post("/guest", async (req, res) => {
  try {
    const guestUser = new User({
      name: `Guest_${Date.now()}`,
      email: `guest_${Date.now()}@example.com`,
      isGuest: true,
    });
    await guestUser.save();

    const token = jwt.sign(
      { userId: guestUser._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        _id: guestUser._id,
        name: guestUser.name,
        email: guestUser.email,
        isGuest: true,
      },
    });
    console.log("guest user logged in suceesfully !token",token,"user",guestUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating guest account" });
  }
});

module.exports = router;