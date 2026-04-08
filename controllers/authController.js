const bcrypt = require("bcrypt");
const User = require("../models/user");
const Supermarket = require("../models/supermarket");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const renderRegisterPage = (req, res) => {
  res.render("auth/register.ejs", { erro: null });
};

const registerSupermarket = async (req, res) => {
  try {
    // "saltRounds" define a complexidade da encriptação (10 é o padrão recomendado)
    const saltRounds = 10;

    const { name, phone, address, email, password } = req.body;
    const passwordEncrypt = await bcrypt.hash(password, saltRounds);

    const newUserSupermarket = await User.create({
      name: name,
      phone: phone,
      address: address,
      email: email,
      password: passwordEncrypt,
      role: "supermarket",
    });

    const newSupermarket = await Supermarket.create({
      user: newUserSupermarket._id,
      name: name,
      location: address,
      status: "pending",
    });

    console.log("Create User Supermarket successful:", newUserSupermarket);
    console.log("Create Supermarket successful:", newSupermarket);

    // Se correr bem, redireciona para o login
    res.redirect("/auth/login");
  } catch (erro) {
    console.error("Erro:", erro);
    res.render("auth/register", {
      erro: "Erro ao gravar na base de dados. Vê o terminal.",
    });
    res.render("auth/register", {
      erro: "Erro ao registar supermercado. Tente novamente.",
    });
  }
};

const registerCourier = async (req, res) => {
  try {
    const saltRounds = 10;
    console.log("Dados recebidos para registo de entregador:", req.body);
    const { name, phone, address, email, password } = req.body;
    const passwordEncrypt = await bcrypt.hash(password, saltRounds);

    const newUserCourier = await User.create({
      name: name,
      phone: phone,
      address: address,
      email: email,
      password: passwordEncrypt,
      role: "courier",
    });

    console.log("Create User Courier successful:", newUserCourier);
    res.redirect("/auth/login");
  } catch (erro) {
    console.error("Erro:", erro);
    res.render("auth/register", {
      erro: "Erro ao registar. Tente novamente.",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
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

  const token = jwt.sign(payload, secretKey, { expiresIn: "24h" });

  res.cookie("token", token, {
    httpOnly: true, // JavaScript não consegue ler (Proteção XSS)
    secure: true, // Só funciona em HTTPS (obrigatório em produção)
    sameSite: "strict", // Protege contra ataques CSRF
    maxAge: 3600000, // Tempo de vida do cookie em milissegundos (1 hora)
  });

  return res.json({ info: "The Login was successful!", token: token });
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
  logout
};
