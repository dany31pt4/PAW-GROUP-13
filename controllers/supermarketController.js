const userService = require("../utils/userService");
const Supermarket = require("../models/supermarket");
const supermarketService = require("../utils/supermarketService");

// 1. Listar Supermercados
const listSupermarkets = async (req, res) => {
  try {
    const supermarkets = await Supermarket.find().populate(
      "user",
      "email phone",
    );
    return res.status(200).json(supermarkets);
  } catch (error) {
    console.error("Erro no Controller de listar supermarkets:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

const listPendingSupermarkets = async (req, res) => {
  try {
    const supermarkets = await supermarketService.getPending();
    return res.status(200).json(supermarkets);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno." });
  }
};

// 2. Criar / Registar Supermercado
const registerSupermarket = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Nome, email e password são obrigatórios.",
      });
    }

    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      address: req.body.address,
      role: "supermarket",
    };

    const newUser = await userService.createUser(userData);

    if (!newUser || !newUser._id) {
      throw new Error("Falha ao obter o ID do utilizador criado.");
    }

    const marketData = {
      user: newUser._id,
      name: req.body.name,
      location: req.body.address,
      status: "pending",
    };

    await supermarketService.createSupermarket(marketData);

    if (req.xhr || req.headers.accept.includes("application/json")) {
      return res.status(201).json({
        success: true,
        message: "Supermercado registado com sucesso!",
      });
    }
    res.redirect("/auth/login");
  } catch (erro) {
    console.error("Erro ao registar supermercado:", erro.message);

    if (req.xhr || req.headers.accept.includes("application/json")) {
      if (erro.message && erro.message.includes("E11000")) {
        return res.status(400).json({
          success: false,
          message: "Este email já está registado no sistema.",
        });
      }
      return res
        .status(500)
        .json({ success: false, message: "Erro ao registar supermercado." });
    }
    res.render("auth/register", { erro: "Erro ao registar." });
  }
};

// 4. Atualizar Supermercado (e o respetivo Utilizador)
const updateSupermarket = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, location, email, status, phone, password, description, schedule, deliveryMethods, deliveryCosts } = req.body;

    const updatedMarket = await Supermarket.findByIdAndUpdate(
      id,
      { name, location, status, description, schedule, deliveryMethods, deliveryCosts },
      { new: true },
    );

    if (!updatedMarket) {
      return res.status(404).json({
        success: false,
        message: "Supermercado não encontrado.",
      });
    }

    if (updatedMarket.user) {
      await userService.updateUser(updatedMarket.user, {
        name,
        email,
        phone,
        address: location,
        password,
      });
    }

    res.json({
      success: true,
      message: "Dados do supermercado e utilizador atualizados com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao atualizar supermercado:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar os dados.",
    });
  }
};

// 5. Eliminar Supermercado
const deleteSupermarket = async (req, res) => {
  try {
    const id = req.params.id;

    const marketToDelete = await Supermarket.findById(id);

    if (!marketToDelete) {
      return res.status(404).json({
        success: false,
        message: "O supermercado já não existia ou não foi encontrado.",
      });
    }

    await Supermarket.findByIdAndDelete(id);

    if (marketToDelete.user) {
      await userService.deleteUser(marketToDelete.user);
    }

    res.json({
      success: true,
      message: "Supermercado removido com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao eliminar supermercado:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao tentar eliminar o registo.",
    });
  }
};

// Supermercado atualiza as suas próprias definições
const updateMySupermarket = async (req, res) => {
  try {
    const { name, description, location, schedule, deliveryMethods, deliveryCosts, email, phone, password } = req.body;

    const updatedMarket = await Supermarket.findByIdAndUpdate(
      req.user.supermarket_id,
      { name, description, location, schedule, deliveryMethods, deliveryCosts },
      { new: true },
    );

    if (!updatedMarket) {
      return res.status(404).json({ success: false, message: "Supermercado não encontrado." });
    }

    await userService.updateUser(req.user.id, { name, email, phone, address: location, password });

    res.json({ success: true, message: "Definições atualizadas com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar definições:", error);
    res.status(500).json({ success: false, message: "Erro ao atualizar as definições." });
  }
};

const approveSupermarket = async (req, res) => {
  try {
    const id = req.params.id;

    const updatedMarket = await Supermarket.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true },
    );

    if (!updatedMarket) {
      return res.status(404).json({
        success: false,
        message: "Supermercado não encontrado.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supermercado validado e ativado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao aprovar supermercado:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao tentar aprovar o registo.",
    });
  }
};

const rejectSupermarket = async (req, res) => {
  try {
    const id = req.params.id;

    const updatedMarket = await Supermarket.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true },
    );

    if (!updatedMarket) {
      return res.status(404).json({
        success: false,
        message: "Supermercado não encontrado.",
      });
    }
    res.status(200).json({
      success: true,
      message: "O registo foi rejeitado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao rejeitar supermercado:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao tentar rejeitar o registo.",
    });
  }
};

const getSupermarketDetails = async (req, res) => {
  try {
    const market = await Supermarket.findById(req.params.id).populate(
      "user",
      "email phone",
    );

    if (!market) {
      return res.status(404).json({
        success: false,
        message: "Supermercado não encontrado.",
      });
    }
    res.status(200).json(market);
  } catch (error) {
    console.error("Erro ao procurar supermercado:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno ao procurar os detalhes.",
    });
  }
};

module.exports = {
  listSupermarkets,
  registerSupermarket,
  getSupermarketDetails,
  updateSupermarket,
  updateMySupermarket,
  deleteSupermarket,
  listPendingSupermarkets,
  rejectSupermarket,
  approveSupermarket,
};
