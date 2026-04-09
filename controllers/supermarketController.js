const userService = require("../utils/userServices");
const { verifyRole } = require("../middlewares/authMiddleware");
const supermarket = require("../models/supermarket");
const bcrypt = require("bcrypt");

const listSupermarkets = async (req, res) => {
  try {
    const supermarkets = await supermarket.find();

    return res.status(200).json(supermarkets);
  } catch (error) {
    console.error("Erro no Controller de listar supermarkets:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};


module.exports = {
    listSupermarkets,
};
