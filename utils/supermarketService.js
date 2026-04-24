const Supermarket = require("../models/supermarket");

const createSupermarket = async (data) => {
  return await Supermarket.create({
    user: data.user,
    name: data.name,
    location: data.location,
    status: data.status,
    deliveryMethods: data.deliveryMethods,
    deliveryCost: data.deliveryCost,
  });
};

const listSupermarkets = async () => {
  return await Supermarket.find().populate("user", "email phone");
};

const getPending = async () => {
  return await Supermarket.find({ status: "pending" }).populate("user", "email phone");
};

const listApproved = async () => {
  return await Supermarket.find({ status: "approved" })
    .select("name location deliveryMethods deliveryCost description schedule");
};

const getMapData = async () => {
  return await Supermarket.find({
    status: "approved",
    "location.lat": { $ne: null },
    "location.lng": { $ne: null },
  }).select("name location");
};

const getSupermarketById = async (id) => {
  return await Supermarket.findById(id).populate("user", "email phone");
};

const updateSupermarket = async (id, data) => {
  return await Supermarket.findByIdAndUpdate(id, data, { new: true });
};

const setStatus = async (id, status) => {
  return await Supermarket.findByIdAndUpdate(id, { status }, { new: true })
    .populate("user", "email name");
};

const deleteSupermarket = async (id) => {
  return await Supermarket.findByIdAndDelete(id);
};

module.exports = {
  createSupermarket,
  listSupermarkets,
  getPending,
  listApproved,
  getMapData,
  getSupermarketById,
  updateSupermarket,
  setStatus,
  deleteSupermarket,
};
