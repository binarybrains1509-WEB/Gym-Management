const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");

/* ===== GET ALL PLANS ===== */
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch plans" });
  }
});

/* ===== CREATE PLAN ===== */
router.post("/", async (req, res) => {
  try {
    const { name, price, duration, features } = req.body;

    const newPlan = await Plan.create({
      name,
      price,
      duration,
      features
    });

    res.status(201).json(newPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create plan" });
  }
});

/* ===== UPDATE PLAN ===== */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Plan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update plan" });
  }
});

/* ===== DELETE PLAN ===== */
router.delete("/:id", async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete plan" });
  }
});

module.exports = router;