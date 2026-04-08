const userService = require("../utils/userServices");
const { verifyRole } = require("../middlewares/authMiddleware");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const createAdmin = async (req, res) => {
  try {
    console.log("REQ BODY:", req.user); // Verificar o conteúdo do corpo da requisição
    await verifyRole(req.user.role);

    if (!req.body.password) {
      return res
        .status(400)
        .json({ message: "A password não chegou ao servidor!" });
    }

    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      address: req.body.address,
      role: "admin",
    };

    const newAdmin = await userService.createUser(userData);
    res.status(201).json(newAdmin); // 201 == created with sucess
  } catch (err) {
    console.error("ERRO NO CONTROLLER:", err.message);
    res.status(400).json({ message: err.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const loggedInUserId = req.user.id;

    if (adminId === loggedInUserId) {
      return res.status(403).json({
        success: false,
        message: "Não podes eliminar a tua própria conta.",
      });
    }

    const deletedAdmin = await User.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Administrador não encontrado.",
      });
    }

    return res.json({
      success: true,
      message: "Administrador removido com sucesso.",
    });
  } catch (error) {
    console.error("Erro na função deleteAdmin:", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor ao tentar remover o administrador.",
    });
  }
};

const listAdmins = async (req, res) => {
  try {
    const admins = await userService.getAdmins();

    return res.status(200).json(admins);
  } catch (error) {
    console.error("Erro no Controller de listar admins:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

const getAdminById = async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await User.findById(adminId).select("-password"); // execto a password

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Administrador não encontrado." });
    }

    return res.status(200).json(admin);
  } catch (error) {
    console.error("Erro ao procurar admin:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno no servidor." });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const saltRounds = 10;
    const adminId = req.params.id;
    const { name, email, password, address, phone } = req.body;

    const updateData = { name, email, address, phone };

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, saltRounds);
      updateData.password = hashed; 
    }

    // Atualiza na base de dados
    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true },
    );

    if (!updatedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Administrador não encontrado." });
    }

    return res.json({
      success: true,
      message: "Administrador atualizado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao atualizar admin:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno ao guardar alterações." });
  }
};
module.exports = {
  createAdmin,
  deleteAdmin,
  listAdmins,
  getAdminById,
  updateAdmin,
};
