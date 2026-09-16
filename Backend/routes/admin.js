const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* GET ALL USERS (password hidden) */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*  UPDATE USER ROLE */
router.put("/user/:id", async (req, res) => {
  const { role } = req.body;

  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ message: "User updated" });
});

/*  DELETE USER */
router.delete("/user/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

module.exports = router;
