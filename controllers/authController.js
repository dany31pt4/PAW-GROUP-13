const bcrypt = require("bcrypt");
const User = require("../models/user");
const Supermarket = require("../models/supermarket");

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


module.exports = {
  renderRegisterPage,
  registerSupermarket,
};
