const Category = require("../models/category");

const createCategory = async (data) => {
  return await Category.create({
    name: data.name,
    description: data.description,
    status: data.status,
  });
};

const listCategories = async () => {
  return await Category.find();
};

const getCategoryById = async (id) => {
  return await Category.findById(id);
};

const updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true });
};

const toggleCategory = async (id) => {
  const cat = await Category.findById(id);
  if (!cat) return null;
  return await Category.findByIdAndUpdate(id, { status: !cat.status }, { new: true });
};

const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};

module.exports = {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  toggleCategory,
  deleteCategory,
};
