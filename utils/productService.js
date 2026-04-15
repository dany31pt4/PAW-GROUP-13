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
        isActive: productData.isActive !== undefined ? productData.isActive : false,
      });
};

const updateProduct = async (id, productData) => {
  return await Product.findByIdAndUpdate(id, productData, { new: true });
};

module.exports = {
  createProduct,
  updateProduct,
};