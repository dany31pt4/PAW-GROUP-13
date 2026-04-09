const Supermarket = require("../models/supermarket");
const bcrypt = require("bcrypt");
require("dotenv").config();

const createSupermarket = async (marketData) => {
  return await Supermarket.create({
    user: marketData.userid, 
    name: marketData.name,
    email: marketData.email,
    location: marketData.location,
    status: marketData.status,
  });
};

module.exports = {
  createSupermarket,
};
