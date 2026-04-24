const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supermarket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supermarket",
      required: true,
    },
    courier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
      },
    ],

    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    deliveryMethod: {
      type: String,
      enum: ["pickup", "courier"],
      required: true,
    },

    deliveryCost: {
      type: Number,
      required: true,
      default: 0,
    },
    deliveryAddress: { type: String, default: null },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "awaiting_courier",
        "delivering",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
