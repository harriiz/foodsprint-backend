const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    menus: {
      type: String,
      required: true,
    },
    adresa: {
      type: String,
      required: true,
    },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    dostavljac: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
