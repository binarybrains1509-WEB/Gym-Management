const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  time: String,
  food: String,
  calories: Number
});

const dietSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  dietTitle: {
    type: String,
    required: true
  },

  meals: [mealSchema],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Diet", dietSchema);
