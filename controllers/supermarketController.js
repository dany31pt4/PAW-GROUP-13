const userService = require("../utils/userServices");
const { verifyRole } = require("../middlewares/authMiddleware");
const Supermarket = require("../models/supermarket"); // Corrigido para maiúscula conforme o modelo
const User = require("../models/user");
const supermarketService = require("../utils/supermarketService");
const bcrypt = require("bcrypt");

// 1. Listar Supermercados
const listSupermarkets = async (req, res) => {
  try {
    const supermarkets = await Supermarket.find().populate("user", "email phone");
    return res.status(200).json(supermarkets);
  } catch (error) {
    console.error("Erro no Controller de listar supermarkets:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

// 2. Criar / Registar Supermercado
const registerSupermarket = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({ success: false, message: "Nome, email e password são obrigatórios." });
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
    
    console.log("Utilizador criado com sucesso com o ID:", newUser._id);

    
    const marketData = {
      user: newUser._id, 
      name: req.body.name,
      location: req.body.address, 
      status: "approved", 
    };

    console.log("Dados a enviar para o supermercado:", marketData);

    
    await supermarketService.createSupermarket(marketData);

    
    if (req.xhr || req.headers.accept.includes("application/json")) {
       return res.status(201).json({ success: true, message: "Supermercado registado com sucesso!" });
    }
    res.redirect("/auth/login");
  } catch (erro) {
    console.error("Erro ao registar supermercado:", erro.message);
    
    if (req.xhr || req.headers.accept.includes("application/json")) {
       if (erro.message && erro.message.includes('E11000')) {
           return res.status(400).json({ success: false, message: "Este email já está registado no sistema." });
       }
       return res.status(500).json({ success: false, message: "Erro ao registar supermercado." });
    }
    res.render("auth/register", { erro: "Erro ao registar." });
  }
};

// 3. Ver Supermercado (Get by ID)
const getSupermarketById = async (req, res) => {
  try {
    const id = req.params.id;
                                                  // o populate é um join, ele vai buscar a referencia ao model,
                                                  // fica o user:{email: "email", phone: "phone"}
    const market = await Supermarket.findById(id).populate("user", "email phone");

    if (!market) {
      return res.status(404).json({ 
        success: false, 
        message: "Supermercado não encontrado." 
      });
    }

    res.json(market);
  } catch (error) {
    console.error("Erro ao buscar supermercado:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno ao procurar os dados." 
    });
  }
};

// 4. Atualizar Supermercado (e o respetivo Utilizador)
const updateSupermarket = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, location, email, status, phone, password } = req.body;

    // 1. Atualiza os dados no modelo Supermarket
    const updatedMarket = await Supermarket.findByIdAndUpdate(
      id,
      { name, location, status },
      { new: true }
    );

    if (!updatedMarket) {
      return res.status(404).json({ 
        success: false, 
        message: "Supermercado não encontrado." 
      });
    }

    if (updatedMarket.user) {
      const userUpdateData = { 
        name: name, 
        email: email, 
        phone: phone, 
        address: location 
      };

      if (password && password.trim() !== "") {
        const saltRounds = 10;
        userUpdateData.password = await bcrypt.hash(password, saltRounds);
      }

      await User.findByIdAndUpdate(updatedMarket.user, userUpdateData);
    }

    res.json({ 
      success: true, 
      message: "Dados do supermercado e utilizador atualizados com sucesso!" 
    });
  } catch (error) {
    console.error("Erro ao atualizar supermercado:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao atualizar os dados." 
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
        message: "O supermercado já não existia ou não foi encontrado." 
      });
    }

    await Supermarket.findByIdAndDelete(id);

    if (marketToDelete.user) {
       await User.findByIdAndDelete(marketToDelete.user);
    }

    res.json({ 
      success: true, 
      message: "Supermercado removido com sucesso!" 
    });
  } catch (error) {
    console.error("Erro ao eliminar supermercado:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao tentar eliminar o registo." 
    });
  }
};

module.exports = {
    listSupermarkets,
    registerSupermarket,
    getSupermarketById,
    updateSupermarket,
    deleteSupermarket,
};