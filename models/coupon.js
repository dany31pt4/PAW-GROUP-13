const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountValue: { type: Number, required: true },
    expiresAt: { type: Date, default: null },
    maxUses: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    supermarket: { type: mongoose.Schema.Types.ObjectId, ref: "Supermarket", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
