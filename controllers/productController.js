const productService = require("../utils/productService");
const Category = require("../models/category");
const Supermarket = require("../models/supermarket");

const createProduct = async (req, res) => {
  try {
    const { name, categoryId, description, price, stock, isActive } = req.body;

    let image = null;
    if (req.file) {
      image = `/uploads/products/${req.file.filename}`;
    }

    if (!name || !categoryId || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: "Nome, categoria, preço e stock são obrigatórios." });
    }

    if (Number(price) < 0) {
      return res.status(400).json({ success: false, message: "O preço não pode ser negativo." });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({ success: false, message: "O stock não pode ser negativo." });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: "Categoria não existe." });
    }

    let supermarketId;
    if (req.user.role === "supermarket") {
      const supermarket = await Supermarket.findOne({ user: req.user.id });
      if (!supermarket) {
        return res.status(404).json({ success: false, message: "Supermercado não encontrado." });
      }
      supermarketId = supermarket._id;
    } else {
      if (!req.body.supermarketId) {
        return res.status(400).json({ success: false, message: "supermarketId é obrigatório para admins." });
      }
      supermarketId = req.body.supermarketId;
    }

    const newProduct = await productService.createProduct({
      supermarket: supermarketId,
      name,
      image,
      category: categoryId,
      description,
      price,
      stock,
      isActive,
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Erro ao criar produto:", error.message);
    res.status(500).json({ success: false, message: "Erro ao criar produto." });
  }
};

const listProduct = async (req, res) => {
  try {
    const products = await productService.listBySupermarket(req.params.id, true);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Erro ao listar produtos:", error.message);
    res.status(500).json({ success: false, message: "Erro ao listar produto." });
  }
};

const listMyProducts = async (req, res) => {
  try {
    const products = await productService.listBySupermarket(req.user.supermarket_id);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Erro ao listar produtos:", error.message);
    res.status(500).json({ success: false, message: "Erro ao listar produtos." });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produto não encontrado." });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Erro ao obter produto:", error.message);
    res.status(500).json({ success: false, message: "Erro ao obter produto." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, categoryId, description, price, stock, isActive } = req.body;

    const product = await productService.getById(req.params.id);
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

    const updatedProduct = await productService.updateProduct(req.params.id, {
      name, image, category: categoryId, description, price, stock, isActive,
    });

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error.message);
    res.status(500).json({ success: false, message: "Erro ao atualizar produto." });
  }
};

const toggleProduct = async (req, res) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produto não encontrado." });
    }

    const updatedProduct = await productService.updateProduct(req.params.id, { isActive: !product.isActive });
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Erro ao alterar estado do produto:", error.message);
    res.status(500).json({ success: false, message: "Erro ao alterar estado do produto." });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deleted = await productService.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Produto não encontrado." });
    }
    res.status(200).json({ success: true, message: "Produto eliminado com sucesso." });
  } catch (error) {
    console.error("Erro ao eliminar produto:", error.message);
    res.status(500).json({ success: false, message: "Erro ao eliminar produto." });
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
