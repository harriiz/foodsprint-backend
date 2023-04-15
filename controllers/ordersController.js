const Order = require("../models/Order");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const upload = require("multer")({ dest: "uploads/" });

// @desc Get all orders
// @route GET /orders
// @access Private
const getAllOrders = asyncHandler(async (req, res) => {
  // Get all orders from MongoDB
  const orders = await Order.find().populate("user").lean();

  // If no orders
  if (!orders?.length) {
    return res.status(400).json({ message: "No orders found" });
  }

  // Add username to each order before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop

  const ordersWithUser = await Promise.all(
    orders.map(async (order) => {
      const user = await User.findById(order.user, "username").lean().exec();

      if (!user) {
        return { ...order, username: "N/A" };
      }
      return { ...order, username: user.username };
    })
  );
  res.json(ordersWithUser);
});

// @desc Create new order
// @route POST /orders
// @access Private
const createNewOrder = asyncHandler(async (req, res) => {
  const { user, totalCost, adresa, date, status, dostavljac } = req.body;

  //Confirm data
  if (!user || !totalCost || !date || !adresa) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Create and store the new user
  const order = await Order.create({
    user,
    totalCost,
    adresa,
    date,
    status,
    dostavljac,
  });

  if (order) {
    // Created
    return res.status(201).json({ message: "New order created" });
  } else {
    return res.status(400).json({ message: "Invalid order data received" });
  }
});

// @desc Update a order
// @route PATCH /orders
// @access Private
const updateOrder = asyncHandler(async (req, res) => {
  const { id, status, dostavljac } = req.body;

  // Confirm order exists to update
  const order = await Order.findById(id).exec();

  if (!order) {
    return res.status(400).json({ message: "Order not found" });
  }

  order.id = id;
  order.status = status;
  order.dostavljac = dostavljac;

  const updatedOrder = await order.save();

  res.json(`'${updatedOrder.id}' updated`);
});

// @desc Delete a order
// @route DELETE /orders
// @access Private
const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Order ID required" });
  }

  // Confirm order exists to delete
  const order = await Order.findById(id).exec();

  if (!order) {
    return res.status(400).json({ message: "Order not found" });
  }

  const result = await order.deleteOne();

  const reply = `Order '${result.totalCost}' with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllOrders,
  createNewOrder,
  updateOrder,
  deleteOrder,
};
