const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  features: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);