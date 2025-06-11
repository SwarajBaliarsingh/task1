const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Session = require("../models/Session");
const router = express.Router();
require("dotenv").config();

const generateToken = (user, location, ip) => {
  return jwt.sign(
    {
      id: user._id,
      location,
      ip,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = new User({ username, password });
  await newUser.save();

  return res.status(201).json({ message: "User registered successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password, location, ip } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const existingSessions = await Session.find({ userId: user._id });
  if (existingSessions.length >= 3) {
    return res.status(429).json(existingSessions);
  }

  const token = generateToken(user, location, ip);
  const newSession = new Session({ userId: user._id, token, location, ip });
  await newSession.save();

  res.status(200).json({ token });
});

// LOGOUT
router.post("/logout", async (req, res) => {
  const tokens = req.body;
  await Session.deleteMany({ token: { $in: tokens } });
  res.status(200).json({ message: "Logged out successfully" });
});

// REPLACE SESSION
router.post("/replaceSession", async (req, res) => {
  const { oldtoken } = req.body;
  const oldSession = await Session.findOne({ token: oldtoken });

  if (!oldSession) {
    return res.status(404).json({ message: "Session not found" });
  }

  const user = await User.findById(oldSession.userId);
  const newToken = generateToken(user, oldSession.location, oldSession.ip);

  await Session.deleteOne({ token: oldtoken });
  await new Session({
    userId: user._id,
    token: newToken,
    location: oldSession.location,
    ip: oldSession.ip,
  }).save();

  res.status(200).json({ token: newToken });
});

module.exports = router;
