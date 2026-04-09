const mongoose = require("mongoose");

const supermarketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    schedule: { type: String },
    deliveryMethods: [{ type: String, enum: ["pickup", "courier"] }],
    deliveryCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Supermarket", supermarketSchema);
