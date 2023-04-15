const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  restoran: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Restoran",
  },
  naziv: {
    type: String,
    required: true,
  },
  cijena: {
    type: Number,
    required: true,
  },
  kategorija: {
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
});

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;
