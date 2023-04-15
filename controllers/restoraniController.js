const Restoran = require("../models/Restoran");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const upload = require("multer")({ dest: "uploads/" });

const getAllRestorani = asyncHandler(async (req, res) => {
  const restorani = await Restoran.find().populate("user").lean();

  if (!restorani?.length) {
    return res.status(400).json({ message: "Restorani nisu pronađeni" });
  }

  const restoraniWithUser = await Promise.all(
    restorani.map(async (restoran) => {
      const user = await User.findById(restoran.user, "username").lean().exec();

      if (!user) {
        return { ...restoran, username: "N/A" };
      }
      return { ...restoran, username: user.username };
    })
  );
  res.json(restoraniWithUser);
});

const createNewRestoran = asyncHandler(async (req, res) => {
  const { user, naziv, kategorija, adresa, image } = req.body;

  if (user == "" || naziv == "" || adresa == "" || kategorija == "") {
    return res
      .status(400)
      .json({ message: "Sva polja moraju biti popunjena!" });
  }

  const duplicate = await Restoran.findOne({ naziv }).lean().exec();

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Restoran s tim imenom već postoji!" });
  }

  const imgResult = await cloudinary.uploader.upload(image, {
    folder: "restorani",
  });

  await Restoran.create({
    user,
    naziv,
    adresa,
    kategorija,
    image: {
      public_id: imgResult.public_id,
      url: imgResult.secure_url,
    },
  })
    .then((createdRestoran) => {
      // Created
      return res.status(201).json({ message: "Restoran uspješno napravljen!" });
    })
    .catch((error) => {
      console.error(error);
      return res
        .status(400)
        .json({ message: "Pravljenje restorana nije uspjelo!" });
    });
});

const updateRestoran = asyncHandler(async (req, res) => {
  const { id, user, naziv, kategorija, adresa, image } = req.body;

  const restoran = await Restoran.findById(id).exec();

  if (!restoran) {
    return res.status(400).json({ message: "Restoran ne postoji" });
  }

  const duplicate = await Restoran.findOne({ naziv }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res
      .status(409)
      .json({ message: "Restoran s tim imenom već postoji" });
  }
  if (image && image.length) {
    await cloudinary.uploader.destroy(restoran.image.public_id);

    const imgResult = await cloudinary.uploader.upload(image, {
      folder: "restorani",
    });

    restoran.image = {
      public_id: imgResult.public_id,
      url: imgResult.secure_url,
    };
  } else {
    restoran.image = restoran.image;
  }

  restoran.user = user;
  restoran.naziv = naziv;
  restoran.adresa = adresa;
  restoran.kategorija = kategorija;

  const updatedRestoran = await restoran.save();

  res.json(`'${updatedRestoran.naziv}' updated`);
});

const searchRestorani = asyncHandler(async (req, res) => {
  const searchQuery = req.query.q;

  const restorani = await Restoran.find({
    naziv: { $regex: searchQuery, $options: "i" },
  })
    .populate("user")
    .lean();

  res.json(restorani);
});

const deleteRestoran = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Restoran ID potreban" });
  }

  const restoran = await Restoran.findById(id).exec();

  if (!restoran) {
    return res.status(400).json({ message: "Restoran ne postoji" });
  }

  const result = await restoran.deleteOne();

  const reply = `Restoran '${result.naziv}' sa ID ${result._id} izbrisan`;

  res.json(reply);
});

module.exports = {
  getAllRestorani,
  createNewRestoran,
  updateRestoran,
  deleteRestoran,
  searchRestorani,
};
