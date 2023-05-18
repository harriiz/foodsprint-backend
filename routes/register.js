const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;

router.post("/register", async (req, res) => {
  const {
    username,
    password,
    roles,
    nazivZahtjev,
    adresaZahtjev,
    slikaZahtjev,
  } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Sva polja moraju biti popunjena" });
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Korisnik s tim imenom već postoji" });
  }

  const hashedPwd = await bcrypt.hash(password, 10);

  let slika = {};
  if (slikaZahtjev) {
    const imgResult = await cloudinary.uploader.upload(slikaZahtjev, {
      folder: "restoranZahtjevi",
    });
    slika = {
      slikaZahtjev: {
        public_id: imgResult.public_id,
        url: imgResult.secure_url,
      },
    };
  }

  const user = await User.create({
    username,
    password: hashedPwd,
    roles: [roles],
    ...(nazivZahtjev && { nazivZahtjev }),
    ...(adresaZahtjev && { adresaZahtjev }),
    ...slika,
  });

  if (user) {
    res.status(201).json({ message: `Novi korisnik ${username} napravljen` });
  } else {
    res.status(400).json({ message: "Registracija neuspješna" });
  }
});

module.exports = router;
