const express = require("express");
const Plan = require("../models/Plan");

const router = express.Router();

/* 🔹 CREATE PLAN */
router.post("/plans", async (req, res) => {
  const { name, price, duration, features } = req.body;

  await Plan.create({
    name,
    price,
    duration,
    features
  });

  res.json({ message: "Plan created" });
});

/* 🔹 GET ALL PLANS (Admin) */
router.get("/plans", async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
});

/* 🔹 UPDATE PLAN */
router.put("/plans/:id", async (req, res) => {
  const { name, price, duration, features } = req.body;

  await Plan.findByIdAndUpdate(req.params.id, {
    name,
    price,
    duration,
    features
  });

  res.json({ message: "Plan updated" });
});

/* 🔹 DELETE PLAN */
router.delete("/plans/:id", async (req, res) => {
  await Plan.findByIdAndDelete(req.params.id);
  res.json({ message: "Plan deleted" });
});

module.exports = router;
