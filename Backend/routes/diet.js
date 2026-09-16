const express = require("express");
const router = express.Router();
const Diet = require("../models/diet");

/* ================= ADD DIET (TRAINER) ================= */
router.post("/trainer/diets", async (req, res) => {
  try {
    const { trainer, user, dietTitle, meals } = req.body;

    if (!trainer || !user || !dietTitle || !meals?.length) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const diet = new Diet({
      trainer,
      user,
      dietTitle,
      meals
    });

    await diet.save();
    res.status(201).json({ message: "Diet added successfully" });

  } catch (err) {
    console.error("ADD DIET ERROR:", err);
    res.status(500).json({ error: "Failed to add diet" });
  }
});

/* ================= GET TRAINER DIETS ================= */
router.get("/trainer/diets/:trainerId", async (req, res) => {
  try {
    const diets = await Diet.find({ trainer: req.params.trainerId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });   // 🔥 latest first

    res.json(diets);
  } catch (err) {
    console.error("GET DIET ERROR:", err);
    res.status(500).json([]);
  }
});

/* ================= UPDATE DIET ================= */
router.put("/trainer/diets/:dietId", async (req, res) => {
  try {
    const { dietTitle, meals, trainer } = req.body;

    const diet = await Diet.findById(req.params.dietId);

    if (!diet) {
      return res.status(404).json({ error: "Diet not found" });
    }

    if (!trainer || diet.trainer.toString() !== trainer) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    diet.dietTitle = dietTitle || diet.dietTitle;
    diet.meals = meals || diet.meals;

    await diet.save();

    res.json({ message: "Diet updated successfully" });

  } catch (err) {
    console.error("UPDATE DIET ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
});
/* ================= DELETE DIET ================= */
router.delete("/trainer/diets/:dietId/:trainerId", async (req, res) => {
  try {
    const { dietId, trainerId } = req.params;

    const diet = await Diet.findById(dietId);

    if (!diet) {
      return res.status(404).json({ error: "Diet not found" });
    }

    // 🔒 SECURITY CHECK
    if (diet.trainer.toString() !== trainerId) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    await diet.deleteOne();

    res.json({ message: "Diet deleted successfully" });

  } catch (err) {
    console.error("DELETE DIET ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ================= USER VIEW DIET ================= */
router.get("/user/diets/:userId", async (req, res) => {
  try {
    const diets = await Diet.find({ user: req.params.userId })
      .populate("trainer", "name specialization")
      .sort({ createdAt: -1 });

    res.json(diets);
  } catch (err) {
    console.error("USER DIET ERROR:", err);
    res.status(500).json([]);
  }
});

module.exports = router;