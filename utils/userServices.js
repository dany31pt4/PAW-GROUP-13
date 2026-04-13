const User = require("../models/user");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const createUser = async (userData) => {
  const hashed = await hashPassword(userData.password);
  return await User.create({
    name: userData.name,
    email: userData.email,
    password: hashed,
    address: userData.address,
    phone: userData.phone,
    role: userData.role,
  });
};

const getUsersByRole = async (role) => {
  return await User.find({ role }).select("-password");
};

const getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

const updateUser = async (id, data) => {
  const updateData = {
    name: data.name,
    email: data.email,
    address: data.address,
    phone: data.phone,
  };

  if (data.password && data.password.trim() !== "") {
    updateData.password = await hashPassword(data.password);
  }

  return await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
};

const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

const getAdmins = async () => {
  return await getUsersByRole("admin");
};

module.exports = {
  createUser,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
  hashPassword,
  getAdmins,
};
