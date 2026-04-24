const bcrypt = require("bcrypt");
const User = require("../models/user");
const Supermarket = require("../models/supermarket");
const jwt = require("jsonwebtoken");
const userService = require("../utils/userService");
const supermarketService = require("../utils/supermarketService");
require("dotenv").config();

const renderRegisterPage = (req, res) => {
  res.render("auth/register.ejs", { erro: null });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }); 
    const secretKey = process.env.secret;
    const rememberMe = req.body.remember === "on";

    if (!user) {
      return res.render("auth/login", { erro: "Email ou password inválidos." });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.render("auth/login", { erro: "Email ou password inválidos." });
    }

    let jwtExpiration = "2h";
    let cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    };

    if (rememberMe) {
      jwtExpiration = "30d";
      cookieOptions.maxAge = 2592000000; // 30 dias em ms
    }

    let token;
    if (user.role == "supermarket") {
      const supermarket = await Supermarket.findOne({ user: user._id });
      if (!supermarket) {
        return res.render("auth/login", {
          erro: "Conta de supermercado inválida. Contacte o suporte.",
        });
      }
      const payload = {
        id: user._id,
        supermarket_id: supermarket._id,
        role: user.role,
        name: user.name,
      };
      token = jwt.sign(payload, secretKey, { expiresIn: jwtExpiration });
    } else {
      const payload = { id: user._id, role: user.role, name: user.name };
      token = jwt.sign(payload, secretKey, { expiresIn: jwtExpiration });
    }

    res.cookie("token", token, cookieOptions);

    return res.redirect("/");
  } catch (erro) {
    console.error("Erro durante o login:", erro);
    return res.render("auth/login", {
      erro: "Ocorreu um erro. Tente novamente.",
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  return res.redirect("/auth/login"); 
};

module.exports = {
  renderRegisterPage,
  login,
  logout,
};
