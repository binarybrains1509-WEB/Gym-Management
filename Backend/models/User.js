const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    username: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["user", "trainer", "admin"],
      default: "user"
    },

    // 🔥 NEW FIELD (Service Selection)
    selectedService: {
      type: String,
      default: null
    },

    // 🔥 Plan reference
    activePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);