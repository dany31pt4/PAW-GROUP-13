const categoryService = require("../utils/categoryService");

const createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !description || status === undefined) {
      return res.status(400).json({ success: false, message: "Nome, descrição e estado são obrigatórios." });
    }

    const newCategory = await categoryService.createCategory({
      name,
      description,
      status: status === "active" || status === true,
    });

    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    console.error("Erro ao criar categoria:", error.message);
    res.status(500).json({ success: false, message: "Erro ao criar categoria." });
  }
};

const listCategories = async (req, res) => {
  try {
    const categories = await categoryService.listCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao listar categorias." });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Categoria não encontrada." });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao procurar categoria." });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const updated = await categoryService.updateCategory(req.params.id, { name, description, status });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Categoria não encontrada." });
    }

    res.json({ success: true, message: "Categoria atualizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    res.status(500).json({ success: false, message: "Erro ao atualizar os dados." });
  }
};

const toggleCategory = async (req, res) => {
  try {
    const updated = await categoryService.toggleCategory(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Categoria não encontrada." });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Erro ao alterar estado da categoria:", error);
    res.status(500).json({ success: false, message: "Erro ao alterar estado." });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const deleted = await categoryService.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Categoria não encontrada." });
    }
    res.json({ success: true, message: "Categoria eliminada com sucesso!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao eliminar categoria." });
  }
};

module.exports = {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  toggleCategory,
  deleteCategory,
};
