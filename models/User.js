const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: [
    {
      type: String,
      default: "Korisnik",
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  nazivZahtjev: {
    type: String,
  },

  adresaZahtjev: {
    type: String,
  },

  slikaZahtjev: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
});

module.exports = mongoose.model("User", userSchema);
