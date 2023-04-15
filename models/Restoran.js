const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const restoranSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    naziv: {
      type: String,
      required: true,
    },
    kategorija: {
      type: String,
      required: true,
    },
    adresa: {
      type: String,
      required: true,
    },
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

restoranSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
});

module.exports = mongoose.model("Restoran", restoranSchema);
