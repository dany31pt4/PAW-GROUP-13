const productService = require("../utils/productService");
const Category = require("../models/category");
const Supermarket = require("../models/supermarket");
const Product = require("../models/product");


const createProduct = async (req, res) => {
  try {
    const { name, categoryId, description, price, stock, isActive } = req.body;

    let image = null;
    if (req.file) {
      image = `/uploads/products/${req.file.filename}`;
    }

    if (!name || !categoryId || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Nome, categoria, preço e stock são obrigatórios.",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({ success: false, message: "O preço não pode ser negativo." });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({ success: false, message: "O stock não pode ser negativo." });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Categoria não existe.",
      });
    }

    let supermarketId;
    if (req.user.role === "supermarket") {
      const supermarket = await Supermarket.findOne({ user: req.user.id });
      if (!supermarket) {
        return res.status(404).json({
          success: false,
          message: "Supermercado não encontrado.",
        });
      }
      supermarketId = supermarket._id;
    } else {
      if (!req.body.supermarketId) {
        return res.status(400).json({
          success: false,
          message: "supermarketId é obrigatório para admins.",
        });
      }
      supermarketId = req.body.supermarketId;
    }

    const productData = {
      supermarket: supermarketId,
      name,
      image,
      category: categoryId,
      description,
      price,
      stock,
      isActive: isActive !== undefined ? isActive : false,
    };

    const newProduct = await productService.createProduct(productData);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Erro ao criar produto:", error.message);
    res.status(500).json({ success: false, message: "Erro ao criar produto." });
  }
};

const listProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const products = await Product.find({
      supermarket: id,
      isActive: true,
    }).populate("category", "name");
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Erro ao listar produtos:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Erro ao listar produto." });
  }
};

// Listar produtos do supermercado logado
const listMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      supermarket: req.user.supermarket_id,
    }).populate("category", "name");
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Erro ao listar produtos:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Erro ao listar produtos." });
  }
};

// Obter produto por id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado." });
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Erro ao obter produto:", error.message);
    res.status(500).json({ success: false, message: "Erro ao obter produto." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, categoryId, description, price, stock, isActive } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produto não encontrado." });
    }

    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({ success: false, message: "O preço não pode ser negativo." });
    }

    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({ success: false, message: "O stock não pode ser negativo." });
    }

    let image = product.image;
    if (req.file) {
      image = `/uploads/products/${req.file.filename}`;
    }

    const updatedProduct = await productService.updateProduct(id, {
      name,
      image,
      category: categoryId,
      description,
      price,
      stock,
      isActive,
    });

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar produto." });
  }
};
const toggleProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado." });
    }

    const updatedProduct = await productService.updateProduct(id, {
      isActive: !product.isActive,
    });
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Erro ao alterar estado do produto:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Erro ao alterar estado do produto." });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado." });
    }

    await Product.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Produto eliminado com sucesso." });
  } catch (error) {
    console.error("Erro ao eliminar produto:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Erro ao eliminar produto." });
  }
};

module.exports = {
  createProduct,
  listProduct,
  listMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProduct,
};
