const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");
const User = require("../models/User");

/* ================= PAYMENT ================= */
router.post("/", async (req, res) => {
  try {
    const { userId, planId, planName, amount } = req.body;

    //  VALIDATION
    if (!userId || !planId || !planName || !amount) {
      return res.status(400).json({
        error: "Invalid payment data"
      });
    }

    //  SAVE PAYMENT
    const payment = new Payment({
      userId,
      planName,
      amount,
      paymentStatus: "success"
    });

    await payment.save();

    //  UPDATE USER ACTIVE PLAN (ObjectId)
    await User.findByIdAndUpdate(userId, {
      activePlan: planId
    });

    res.json({
      message: "Payment successful",
      activePlanId: planId,
      activePlanName: planName
    });

  } catch (err) {
    console.error(" PAYMENT ERROR:", err);
    res.status(500).json({
      error: "Payment failed"
    });
  }
});

module.exports = router;
