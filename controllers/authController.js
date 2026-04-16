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
    const user = await User.findOne({ email: email }); // Procura o utilizador pelo email no mongo
    const secretKey = process.env.secret;
    const rememberMe = req.body.remember === "on";

    let jwtExpiration = "1h";
    var age = 3600000; // 1 hora

    if (!user) {
      return res.render("auth/login", { erro: "Email ou password inválidos." });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.render("auth/login", { erro: "Email ou password inválidos." });
    }

    let token;
    if (user.role == "supermarket") {
      const supermarket = await Supermarket.findOne({ user: user._id });
      token = jwt.sign(
        { id: user._id, supermarket_id: supermarket._id, role: user.role, name: user.name },
        secretKey,
        { expiresIn: jwtExpiration },
      );
    } else {
      token = jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        secretKey,
        { expiresIn: jwtExpiration },
      );
    }

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
  login,
  logout,
};
