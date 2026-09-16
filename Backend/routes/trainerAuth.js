const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Trainer = require("../models/trainers");

/* ================= TRAINER SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    // 🔒 validation
    if (!name || !email || !password || !specialization) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    // 🔍 check existing trainer
    const existing = await Trainer.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "Trainer already exists"
      });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 save trainer
    const trainer = new Trainer({
      name,
      email,
      specialization,
      password: hashedPassword
    });

    await trainer.save();

    res.status(201).json({
      message: "Trainer signup successful",
      trainerId: trainer._id
    });

  } catch (err) {
    console.error("TRAINER SIGNUP ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

/* ================= TRAINER LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔒 validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email & password required"
      });
    }

    // 🔍 find trainer
    const trainer = await Trainer.findOne({ email }).select("+password");

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found"
      });
    }

    // 🔐 check password
    const isMatch = await bcrypt.compare(password, trainer.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    // ✅ success
    res.json({
      message: "Login successful",
      trainerId: trainer._id,
      name: trainer.name,
      role: trainer.role
    });

  } catch (err) {
    console.error("TRAINER LOGIN ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;
