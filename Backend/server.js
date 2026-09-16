require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

/* ===== MODELS ===== */
const User = require("./models/User");
const Payment = require("./models/Payment");
const Review = require("./models/review");
const Trainer = require("./models/trainers");
const Workout = require("./models/workouts");

/* ===== ROUTES ===== */
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const trainerAuthRoutes = require("./routes/trainerAuth");
const dietRoutes = require("./routes/diet");
const planRoutes = require("./routes/plans");   //  PLAN ROUTE
const userRoutes = require("./routes/users");

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());

app.use(dietRoutes);
app.use("/api/trainer", trainerAuthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/admin/plans", planRoutes);  //  PLAN CRUD ROUTE
app.use("/api/user", userRoutes); 

/* ===== SERVE FRONTEND ===== */
app.use(express.static(path.join(__dirname, "../frontend")));

/* ===== AUTO CREATE UPLOADS FOLDER (Vercel-safe: /tmp) ===== */
if (!fs.existsSync("/tmp/uploads")) {
  fs.mkdirSync("/tmp/uploads", { recursive: true });
}

/* ===== STATIC UPLOADS ===== */
app.use("/uploads", express.static("/tmp/uploads"));

/* ===== MULTER CONFIG (Vercel-safe: /tmp) ===== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/tmp/uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  }
});

/* ===== ROOT PAGE ===== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/home.html"));
});

/* ================= USERS ================= */
app.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find().populate("activePlan");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* ================= PAYMENTS ================= */
app.get("/admin/payments", async (req, res) => {
  try {
    res.json(await Payment.find().sort({ paymentDate: -1 }));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

/* ================= REVIEWS ================= */
app.get("/reviews", async (req, res) => {
  try {
    res.json(await Review.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

app.post("/reviews", upload.single("userImage"), async (req, res) => {
  try {
    const review = new Review({
      ...req.body,
      userImage: req.file ? `/uploads/${req.file.filename}` : null
    });

    await review.save();
    res.json({ message: "Review added successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= TRAINER WORKOUT ================= */
app.post("/trainer/workouts", async (req, res) => {
  try {
    const workout = new Workout(req.body);
    await workout.save();
    res.json({ message: "Workout added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add workout" });
  }
});

app.get("/user/workouts/:userId", async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.params.userId })
      .populate("trainer", "name specialization");

    res.json(workouts);
  } catch (err) {
    res.status(500).json([]);
  }
});

/* ================= ADMIN TRAINER MANAGEMENT ================= */

// GET ALL TRAINERS
app.get("/admin/trainers", async (req, res) => {
  try {
    const trainers = await Trainer.find().select("-password");
    res.json(trainers);
  } catch (err) {
    console.error("FETCH TRAINERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch trainers" });
  }
});

// DELETE TRAINER
app.delete("/admin/trainers/:id", async (req, res) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.json({ message: "Trainer deleted successfully" });
  } catch (err) {
    console.error("DELETE TRAINER ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ================= ADMIN - GET ALL USERS ================= */
app.get("/admin/all-users", async (req, res) => {
  try {
    // Only normal users (not trainer/admin)
    const users = await User.find({ role: "user" })
      .select("name email");

    res.json(users);

  } catch (err) {
    console.error("FETCH ALL USERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* ================= ADMIN - ASSIGN USER TO TRAINER ================= */
app.post("/admin/trainers/assign", async (req, res) => {
  try {
    const { trainerId, userId } = req.body;

    if (!trainerId || !userId) {
      return res.status(400).json({ error: "Missing trainerId or userId" });
    }

    const trainer = await Trainer.findById(trainerId);

    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    //  Prevent duplicate assignment
    const alreadyAssigned = trainer.assignedUsers.some(
      a => a.user.toString() === userId
    );

    if (alreadyAssigned) {
      return res.status(400).json({ error: "User already assigned" });
    }

    trainer.assignedUsers.push({
      user: userId,
      status: "pending"
    });

    await trainer.save();

    res.json({ message: "User assigned successfully" });

  } catch (err) {
    console.error("ASSIGN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= ADMIN - DELETE REVIEW ================= */
app.delete("/admin/reviews/:id", async (req, res) => {
  try {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Review deleted successfully" });

  } catch (err) {
    console.error("DELETE REVIEW ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= TRAINER PROFILE ================= */

//  VIEW TRAINER PROFILE
app.get("/trainer/profile/:id", async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id).select("-password");

    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    res.json(trainer);

  } catch (err) {
    console.error("VIEW PROFILE ERROR:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// UPDATE TRAINER PROFILE + IMAGE
app.put(
  "/trainer/profile/:id",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { name, specialization } = req.body;

      if (!name || !specialization) {
        return res.status(400).json({
          error: "Name and specialization required"
        });
      }

      const trainer = await Trainer.findById(req.params.id);

      if (!trainer) {
        return res.status(404).json({ error: "Trainer not found" });
      }

      trainer.name = name.trim();
      trainer.specialization = specialization.trim();

      if (req.file) {
        trainer.profileImage = `/uploads/${req.file.filename}`;
      }

      await trainer.save();

      res.json({
        message: "Profile updated successfully",
        trainer
      });

    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
      res.status(500).json({ error: "Profile update failed" });
    }
  }
);

/* ================= TRAINER ASSIGNED USERS ================= */

// GET ASSIGNED USERS
app.get("/trainer/assigned-users/:trainerId", async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.trainerId)
      .populate({
        path: "assignedUsers.user",
        populate: {
          path: "activePlan",
          model: "Plan"
        }
      });

    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    res.json(trainer.assignedUsers);

  } catch (err) {
    console.error("ASSIGNED USERS ERROR:", err);
    res.status(500).json({ error: "Failed to load assigned users" });
  }
});


// UPDATE STATUS (ACCEPT / REJECT)
app.put("/trainer/assigned-users/status", async (req, res) => {
  try {
    const { trainerId, userId, status } = req.body;

    if (!trainerId || !userId || !status) {
      return res.status(400).json({ error: "Missing data" });
    }

    const trainer = await Trainer.findById(trainerId);

    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    const assigned = trainer.assignedUsers.find(
      a => a.user.toString() === userId
    );

    if (!assigned) {
      return res.status(404).json({ error: "User not assigned" });
    }

    assigned.status = status;
    await trainer.save();

    res.json({ message: "Status updated successfully" });

  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
});
/* ================= ADMIN - UPDATE USER ================= */
app.put("/admin/users/:id", async (req, res) => {
  try {
    const { name, email, role, activePlan } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name;
    user.email = email;
    user.role = role;

    //  Plan update (null if empty)
    user.activePlan = activePlan || null;

    await user.save();

    res.json({ message: "User updated successfully" });

  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
});
/* ================= ADMIN - DELETE USER ================= */
app.delete("/admin/users/:id", async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ===== START LOCALLY / EXPORT FOR VERCEL ===== */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log("Backend server is running");
    console.log(`Listening on port: ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
}

module.exports = app;