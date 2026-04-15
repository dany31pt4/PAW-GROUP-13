const Order = require("../models/order");

const createOrder = async (orderData) => {
  return await Order.create(orderData);
};

const getOrderById = async (id) => {
  return await Order.findById(id)
    .populate("customer", "name email phone")
    .populate("supermarket", "name location")
    .populate("courier", "name email phone")
    .populate("products.product", "name price image");
};

const getOrdersByCustomer = async (customerId) => {
  return await Order.find({ customer: customerId })
    .populate("supermarket", "name location")
    .populate("products.product", "name price image")
    .sort({ createdAt: -1 });
};

const getOrdersBySupermarket = async (supermarketId) => {
  return await Order.find({ supermarket: supermarketId })
    .populate("customer", "name email phone")
    .populate("courier", "name email phone")
    .populate("products.product", "name price image")
    .sort({ createdAt: -1 });
};

const getAllOrders = async () => {
  return await Order.find()
    .populate("customer", "name email phone")
    .populate("supermarket", "name location")
    .populate("courier", "name email phone")
    .populate("products.product", "name price image")
    .sort({ createdAt: -1 });
};

const updateOrderStatus = async (id, status) => {
  return await Order.findByIdAndUpdate(id, { status }, { new: true });
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByCustomer,
  getOrdersBySupermarket,
  getAllOrders,
  updateOrderStatus,
};
