const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  token: String,
  location: String,
  ip: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Session", sessionSchema);
