const User = require("../models/user");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const createUser = async (payload) => {
  const hashed = await hashPassword(payload.password);
  return await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: hashed,
    address: payload.address,
    phone: payload.phone,
    role: payload.role,
  });
};

const getUsersByRole = async (role) => {
  const filter = { role };
  if (role === "admin") filter.isSuperAdmin = { $ne: true };
  return await User.find(filter).select("-password");
};

const getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

const getUserByEmail = async (email, role) => {
  const filter = { email: email.toLowerCase() };
  if (role) filter.role = role;
  return await User.findOne(filter).select("-password");
};

const updateUser = async (id, data) => {
  const payload = {
    name: data.name,
    email: data.email,
    address: data.address,
    phone: data.phone,
  };

  if (data.password && data.password.trim() !== "") {
    payload.password = await hashPassword(data.password);
  }

  return await User.findByIdAndUpdate(id, payload, { new: true }).select("-password");
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
  getUserByEmail,
  updateUser,
  deleteUser,
  hashPassword,
  getAdmins,
};
