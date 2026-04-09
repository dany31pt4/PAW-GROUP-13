const bcrypt = require("bcrypt");
const User = require("../models/user");
const Supermarket = require("../models/supermarket");
const jwt = require("jsonwebtoken");
const userService = require("../utils/userServices");
const supermarketService = require("../utils/supermarketService");
require("dotenv").config();

const renderRegisterPage = (req, res) => {
  res.render("auth/register.ejs", { erro: null });
};

const registerSupermarket = async (req, res) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      address: req.body.address,
      role: "supermarket",
    };

    console.log(userData);

    const user = await userService.createUser(userData);
    const marketData = {
      userid: user._id,
      name: req.body.name,
      email: req.body.email,
      location: req.body.address,
      status: "pending",
    };

    console.log(marketData);
    await supermarketService.createSupermarket(marketData);

    res.redirect("/auth/login");
  } catch (erro) {
    console.log(erro);
    res.render("auth/register", { erro: "Erro ao registar." });
  }
};

const registerCourier = async (req, res) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      address: req.body.address,
      role: "courier",
    };

    await userService.createUser(userData);
    res.redirect("/auth/login");
  } catch (erro) {
    res.render("auth/register", { erro: "Erro ao registar." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }); // Procura o utilizador pelo email no mongo
    const secretKey = process.env.secret;
    const rememberMe = req.body.remember === "on";
    
    console.log(req.body);
    let jwtExpiration = "1h";
    var age = 3600000; // 1 hora

    if (!user) {
      return res.render("auth/login", { erro: "Email ou password inválidos." });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.render("auth/login", { erro: "Email ou password inválidos." });
    }

    const payload = {
      id: user._id,
      email: user.email,
    };

    if (rememberMe) {
      jwtExpiration = "30d";
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      secretKey,
      { expiresIn: jwtExpiration }, 
    );

    if (rememberMe) {
      age = 2592000000; // 30 dias
    }   

    res.cookie("token", token, {
      httpOnly: true, // JavaScript não consegue ler (Proteção XSS)
      secure: false, // Se True so  funciona em HTTPS , mas como tamos em desenvolvimento local, deixamos false.
      sameSite: "strict", // Protege contra ataques CSRF
      maxAge: age, // Tempo de vida do cookie em milissegundos (1 hora)
    });

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
  console.log("Logout successful, token cookie cleared.");
  return res.redirect("/auth/login"); // ou res.json
};

module.exports = {
  renderRegisterPage,
  registerSupermarket,
  registerCourier,
  login,
  logout,
};
