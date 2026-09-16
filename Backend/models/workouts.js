const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
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

  workoutTitle: {
    type: String,
    required: true
  },

  exercises: [
    {
      name: String,
      sets: Number,
      reps: Number
    }
  ],

  notes: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Workout", workoutSchema);
