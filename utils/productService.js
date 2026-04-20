const Product = require("../models/product");

const createProduct = async (productData) => {
    let isActiveVal = false;
    if (productData.isActive !== undefined) {
      isActiveVal = productData.isActive;
    }
    return await Product.create({
        supermarket: productData.supermarket,
        name: productData.name,
        image: productData.image,
        category: productData.category,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        isActive: isActiveVal,
      });
};

const updateProduct = async (id, productData) => {
  return await Product.findByIdAndUpdate(id, productData, { new: true });
};

module.exports = {
  createProduct,
  updateProduct,
};