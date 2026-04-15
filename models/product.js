const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    supermarket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supermarket",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
