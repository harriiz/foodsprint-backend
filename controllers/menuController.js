const Menu = require("../models/Menu");
const asyncHandler = require("express-async-handler");
const Restoran = require("../models/Restoran");
const cloudinary = require("cloudinary").v2;

const getAllMenus = asyncHandler(async (req, res) => {
  const menus = await Menu.find().populate("restoran").lean();

  if (!menus?.length) {
    return res.status(400).json({ message: "No menus found" });
  }
  const menuswithRestoran = await Promise.all(
    menus.map(async (menu) => {
      const restoran = await Restoran.findById(menu.user, "username")
        .lean()
        .exec();

      if (!restoran) {
        return { ...menu, username: "N/A" };
      }
      return { ...menu, username: user.username };
    })
  );
  res.json(menuswithRestoran);
});

const createNewMenu = asyncHandler(async (req, res) => {
  const { restoran, naziv, cijena, kategorija, image } = req.body;

  const imgResult = await cloudinary.uploader.upload(image, {
    folder: "menu",
  });

  const menu = await Menu.create({
    restoran,
    naziv,
    cijena,
    kategorija,
    image: {
      public_id: imgResult.public_id,
      url: imgResult.secure_url,
    },
  });
});

const updateMenu = asyncHandler(async (req, res) => {
  const { id, restoran, naziv, cijena, kategorija, image } = req.body;

  const menu = await Menu.findById(id).exec();

  if (image && image.length) {
    await cloudinary.uploader.destroy(menu.image.public_id);

    const imgResult = await cloudinary.uploader.upload(image, {
      folder: "menu",
    });

    menu.image = {
      public_id: imgResult.public_id,
      url: imgResult.secure_url,
    };
  } else {
    menu.image = menu.image;
  }

  menu.restoran = restoran;
  menu.naziv = naziv;
  menu.cijena = cijena;
  menu.kategorija = kategorija;

  const updatedMenu = await menu.save();
  res.json(`${updatedMenu.naziv} updated`);
});

const deleteMenu = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Menu ID potreban" });
  }

  const menu = await Menu.findById(id).exec();

  const result = await menu.deleteOne();
  const reply = `Menu '${result.naziv}' deleted`;
  res.json(reply);
});

module.exports = {
  getAllMenus,
  createNewMenu,
  updateMenu,
  deleteMenu,
};
