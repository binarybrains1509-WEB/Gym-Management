const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
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

    password: {
      type: String,
      required: true,
      select: false // 
    },

    specialization: {
      type: String,
      required: true
    },

    profileImage: {
      type: String,
      default: null
    },

    role: {
      type: String,
      default: "trainer"
    },

    // ASSIGNED USERS (AS-IS, logic unchanged)
    assignedUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending"
        },
        assignedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true // createdAt + updatedAt auto
  }
);

module.exports = mongoose.model("Trainer", trainerSchema);
