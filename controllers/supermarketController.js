const userService = require("../utils/userService");
const supermarketService = require("../utils/supermarketService");
const { sendSupermarketStatusEmail } = require("../utils/emailService");
const { geocodeAddress } = require("../utils/geocodeService");

const listSupermarkets = async (req, res) => {
  try {
    const supermarkets = await supermarketService.listSupermarkets();
    return res.status(200).json(supermarkets);
  } catch (error) {
    console.error("Erro ao listar supermercados:", error);
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

const listApprovedSupermarkets = async (req, res) => {
  try {
    const supermarkets = await supermarketService.listApproved();
    res.json(supermarkets);
  } catch (error) {
    res.status(500).json({ message: "Erro interno." });
  }
};

const registerSupermarket = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Nome, email e password são obrigatórios.",
      });
    }

    const newUser = await userService.createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      address: req.body.address,
      role: "supermarket",
    });

    if (!newUser || !newUser._id) {
      throw new Error("Falha ao obter o ID do utilizador criado.");
    }

    const address = req.body.address;
    const coords = await geocodeAddress(address);

    await supermarketService.createSupermarket({
      user: newUser._id,
      name: req.body.name,
      location: { address, lat: coords?.lat || null, lng: coords?.lng || null },
      status: "pending",
      deliveryMethods: ["pickup"],
      deliveryCost: 0,
    });

    if (req.xhr || req.headers.accept.includes("application/json")) {
      return res.status(201).json({ success: true, message: "Supermercado registado com sucesso!" });
    }
    res.redirect("/auth/login");
  } catch (erro) {
    console.error("Erro ao registar supermercado:", erro.message);

    if (req.xhr || req.headers.accept.includes("application/json")) {
      if (erro.message && erro.message.includes("E11000")) {
        return res.status(400).json({ success: false, message: "Este email já está registado no sistema." });
      }
      return res.status(500).json({ success: false, message: "Erro ao registar supermercado." });
    }
    res.render("auth/register", { erro: "Erro ao registar." });
  }
};

const getSupermarketDetails = async (req, res) => {
  try {
    const market = await supermarketService.getSupermarketById(req.params.id);
    if (!market) {
      return res.status(404).json({ success: false, message: "Supermercado não encontrado." });
    }
    res.status(200).json(market);
  } catch (error) {
    console.error("Erro ao procurar supermercado:", error);
    res.status(500).json({ success: false, message: "Erro interno ao procurar os detalhes." });
  }
};

const updateSupermarket = async (req, res) => {
  try {
    const { name, location, email, status, phone, password, description, schedule, deliveryMethods, deliveryCost } = req.body;

    const coords = await geocodeAddress(location);
    const locationObj = { address: location, lat: coords?.lat || null, lng: coords?.lng || null };

    const updatedMarket = await supermarketService.updateSupermarket(req.params.id, {
      name, location: locationObj, status, description, schedule, deliveryMethods, deliveryCost,
    });

    if (!updatedMarket) {
      return res.status(404).json({ success: false, message: "Supermercado não encontrado." });
    }

    if (updatedMarket.user) {
      await userService.updateUser(updatedMarket.user, { name, email, phone, address: location, password });
    }

    res.json({ success: true, message: "Dados do supermercado e utilizador atualizados com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar supermercado:", error);
    res.status(500).json({ success: false, message: "Erro ao atualizar os dados." });
  }
};

const updateMySupermarket = async (req, res) => {
  try {
    const { name, description, location, schedule, deliveryMethods, deliveryCost, email, phone, password } = req.body;

    const coords = await geocodeAddress(location);
    const locationObj = { address: location, lat: coords?.lat || null, lng: coords?.lng || null };

    const updatedMarket = await supermarketService.updateSupermarket(req.user.supermarket_id, {
      name, description, location: locationObj, schedule, deliveryMethods, deliveryCost,
    });

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
    const updatedMarket = await supermarketService.setStatus(req.params.id, "approved");

    if (!updatedMarket) {
      return res.status(404).json({ success: false, message: "Supermercado não encontrado." });
    }

    if (updatedMarket.user && updatedMarket.user.email) {
      await sendSupermarketStatusEmail(updatedMarket.user.email, updatedMarket.name, "approved");
    }

    res.status(200).json({ success: true, message: "Supermercado validado e ativado com sucesso!" });
  } catch (error) {
    console.error("Erro ao aprovar supermercado:", error);
    res.status(500).json({ success: false, message: "Erro ao tentar aprovar o registo." });
  }
};

const rejectSupermarket = async (req, res) => {
  try {
    const updatedMarket = await supermarketService.setStatus(req.params.id, "rejected");

    if (!updatedMarket) {
      return res.status(404).json({ success: false, message: "Supermercado não encontrado." });
    }

    if (updatedMarket.user && updatedMarket.user.email) {
      await sendSupermarketStatusEmail(updatedMarket.user.email, updatedMarket.name, "rejected");
    }

    res.status(200).json({ success: true, message: "O registo foi rejeitado com sucesso!" });
  } catch (error) {
    console.error("Erro ao rejeitar supermercado:", error);
    res.status(500).json({ success: false, message: "Erro ao tentar rejeitar o registo." });
  }
};

const deleteSupermarket = async (req, res) => {
  try {
    const market = await supermarketService.getSupermarketById(req.params.id);

    if (!market) {
      return res.status(404).json({ success: false, message: "O supermercado já não existia ou não foi encontrado." });
    }

    await supermarketService.deleteSupermarket(req.params.id);

    if (market.user) {
      await userService.deleteUser(market.user._id || market.user);
    }

    res.json({ success: true, message: "Supermercado removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao eliminar supermercado:", error);
    res.status(500).json({ success: false, message: "Erro ao tentar eliminar o registo." });
  }
};

const getMapSupermarkets = async (req, res) => {
  try {
    const markets = await supermarketService.getMapData();
    res.json(markets);
  } catch (error) {
    console.error("Erro ao buscar supermercados para mapa:", error);
    res.status(500).json({ message: "Erro ao carregar supermercados." });
  }
};

module.exports = {
  listSupermarkets,
  listApprovedSupermarkets,
  registerSupermarket,
  getSupermarketDetails,
  updateSupermarket,
  updateMySupermarket,
  deleteSupermarket,
  listPendingSupermarkets,
  rejectSupermarket,
  approveSupermarket,
  getMapSupermarkets,
};
