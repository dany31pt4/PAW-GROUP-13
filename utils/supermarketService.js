const Supermarket = require("../models/supermarket");
const bcrypt = require("bcrypt");
require("dotenv").config();

const createSupermarket = async (marketData) => {
  return await Supermarket.create({
    user: marketData.user,         
    name: marketData.name,
    location: marketData.location, 
    status: marketData.status,
  });
};
const getPending = async () => {
    return await Supermarket.find({ status: "pending" }).populate("user", "email phone");
};
module.exports = {
  createSupermarket,
  getPending,
};

