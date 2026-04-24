const Product = require("../models/product");

const createProduct = async (productData) => {
  return await Product.create({
    supermarket: productData.supermarket,
    name: productData.name,
    image: productData.image,
    category: productData.category,
    description: productData.description,
    price: productData.price,
    stock: productData.stock,
    isActive: productData.isActive ?? false,
  });
};

const listBySupermarket = async (supermarketId, onlyActive = false) => {
  const filter = { supermarket: supermarketId };
  if (onlyActive) filter.isActive = true;
  return await Product.find(filter).populate("category", "name");
};

const getById = async (id) => {
  return await Product.findById(id).populate("category", "name");
};

const updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

module.exports = {
  createProduct,
  listBySupermarket,
  getById,
  updateProduct,
  deleteProduct,
};
