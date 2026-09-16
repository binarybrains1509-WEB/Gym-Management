const express = require("express");
const User = require("../models/User");

const router = express.Router();

/* ================= SAVE SELECTED SERVICE ================= */
router.post("/select-service", async (req, res) => {
  const { userId, service } = req.body;

  try {
    if (!userId || !service) {
      return res.status(400).json({ message: "Missing data" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 Prevent re-selection
    if (user.selectedService) {
      return res.status(400).json({
        message: "Service already selected"
      });
    }

    user.selectedService = service;
    await user.save();

    res.status(200).json({
      message: "Service selected successfully"
    });

  } catch (err) {
    console.error("SERVICE UPDATE ERROR:", err);
    res.status(500).json({
      message: "Error updating service"
    });
  }
});

/* ================= GET USER SELECTED SERVICE ================= */
router.get("/:id/service", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.selectedService) {
      return res.json({ hasService: false });
    }

    res.json({
      hasService: true,
      service: user.selectedService
    });

  } catch (err) {
    console.error("FETCH SERVICE ERROR:", err);
    res.status(500).json({
      message: "Error fetching service"
    });
  }
});

/* ================= GET USER ACTIVE PLAN ================= */
router.get("/:id/plan", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("activePlan");

    if (!user || !user.activePlan) {
      return res.json({ hasPlan: false });
    }

    res.json({
      hasPlan: true,
      planId: user.activePlan._id,
      planName: user.activePlan.name
    });

  } catch (err) {
    console.error("FETCH PLAN ERROR:", err);
    res.status(500).json({
      message: "Error fetching plan"
    });
  }
});

module.exports = router;