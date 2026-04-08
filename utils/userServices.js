const User = require("../models/user");
const bcrypt = require("bcrypt");

require("dotenv").config();
const createUser = async (userData) => {
  const saltRounds = 10;
  const hashed = await bcrypt.hash(userData.password, saltRounds);
  return await User.create({
    name: userData.name,
    email: userData.email,
    password: hashed,
    address: userData.address,
    phone: userData.phone,
    role: userData.role,
  });
};

const getAdmins = async () => {
  const admins = await User.find({ role: "admin" });
  return admins;
};

module.exports = {
  createUser,
  getAdmins,
};
