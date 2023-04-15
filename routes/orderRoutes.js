const express = require("express");
const router = express.Router();
// const ordersController = require("../controllers/ordersController");
const verifyJWT = require("../middleware/verifyJWT");
const upload = require("multer")({ dest: "uploads/" });
const Order = require("../models/Order");
const ordersController = require("../controllers/ordersController");
router.use(verifyJWT);

router.post("/", async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  const orders = await Order.find().lean();
  if (!orders.length) {
    return res.status(400).json({ message: "No orders found" });
  }

  res.json(orders);
});

router.route("/").patch(ordersController.updateOrder);
module.exports = router;
