const categoryService = require("../utils/categoryService");
var { verifyRole } = require("../middlewares/authMiddleware");
const Category = require("../models/category");
const createCategory = async (req, res) => {
  try {
    if (!req.body.name || !req.body.description || !req.body.status) {
      return res.status(400).json({
        success: false,
        message: "Nome, descrição e estado são obrigatórios.",
      });
    }

    console.log("Dados recebidos para criação de categoria:", req.body);
    await verifyRole(req.user.role);
    if (req.body.status == "active") {
      req.body.status = true;
    } else {
      req.body.status = false;
    }
    const categoryData = {
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
    };

    const newCategory = await categoryService.createCategory(categoryData);

    if (!newCategory) {
      throw new Error("Falha ao criar a categoria.");
    }

    console.log("Categoria criada com sucesso com o ID:", newCategory._id);

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Erro ao criar categoria:", error.message);

    return res
      .status(500)
      .json({ success: false, message: "Erro ao criar categoria." });
  }
};

const listCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    console.log("Categorias encontradas:", categories);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar categorias." });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Erro ao procurar categoria" });
  }
};

const updateCategory = async (req, res) => {
  console.log("Dados recebidos para atualização de categoria:", req.body);
  try {
    const id = req.params.id;
    const { name, description, status } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, status }, 
      { new: true },
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Categoria não encontrada.",
      });
    }

    res.json({
      success: true,
      message: "Dados da categoria atualizados com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar os dados.",
    });
  }
};

const  deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ message: "Erro ao eliminar" });
      }
};

module.exports = {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
