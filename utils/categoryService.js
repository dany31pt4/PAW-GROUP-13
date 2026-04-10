const Category = require("../models/category");
const bcrypt = require("bcrypt");
require("dotenv").config();

const createCategory = async (categoryData) => {
  return await Category.create({
    name: categoryData.name,
    description: categoryData.description,
    status: categoryData.status,
  });
};


module.exports = {
  createCategory,
};