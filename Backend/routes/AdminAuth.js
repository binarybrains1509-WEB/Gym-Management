const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

/* ================= ADMIN LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if(!username || !password){
      return res.status(400).json({
        message: "Username and password required"
      });
    }

    // 🔍 find admin
    const admin = await Admin.findOne({ username });

    if(!admin){
      return res.status(401).json({
        message: "Invalid admin credentials"
      });
    }

    // 🔐 password check (fixed password for now)
    if(password !== admin.password){
      return res.status(401).json({
        message: "Invalid admin credentials"
      });
    }

    // 🕒 update last login time
    admin.lastLoginAt = new Date();
    await admin.save();

    res.json({
      message: "Admin login successful",
      adminId: admin._id,
      lastLoginAt: admin.lastLoginAt
    });

  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;
