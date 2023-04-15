const User = require("../models/User");
const Restoran = require("../models/Restoran");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are requiredd" });
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  const hashedPwd = await bcrypt.hash(password, 10);

  const userObject = { username, password: hashedPwd, roles };

  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

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

  const userObject = { username, password: hashedPwd, role: "Korisnik" };

  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "Sva polja osim šifre moraju biti popunjena" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "Korisnik nije pronađen" });
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Taj korisnik već postoji" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Korisnički ID Potreban" });
  }

  const restoran = await Restoran.findOne({ user: id }).lean().exec();
  if (restoran) {
    return res.status(400).json({
      message: "Korisnik ima restoran, molimo prvo uklonite restoran",
    });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "Korisnik ne postoji" });
  }

  const result = await user.deleteOne();

  const reply = `Korisnik ${result.username} sa ID ${result._id}je izbirisan`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
