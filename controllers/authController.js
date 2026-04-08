const bcrypt = require("bcrypt");
const User = require("../models/user");
const Supermarket = require("../models/supermarket");
const jwt = require("jsonwebtoken");
const userService = require("../utils/userServices");

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

    await userService.createUser(userData);
    res.redirect("/auth/login");
  } catch (erro) {
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

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      secretKey,
      { expiresIn: "1h" },
    );
    res.cookie("token", token, {
      httpOnly: true, // JavaScript não consegue ler (Proteção XSS)
      secure: false, // Se True so  funciona em HTTPS , mas como tamos em desenvolvimento local, deixamos false.
      sameSite: "strict", // Protege contra ataques CSRF
      maxAge: 3600000, // Tempo de vida do cookie em milissegundos (1 hora)
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
