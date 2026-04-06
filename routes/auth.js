var express = require("express");
var router = express.Router();
const User = require("../models/user");
const Supermarket = require("../models/supermarket");
const bcrypt = require('bcrypt');
const authController = require('../controllers/authController');
//pagina de login
router.get("/login", (req, res) => {
  res.render("auth/login", { erro: null });
});

//Render register page
router.get("/register", authController.renderRegisterPage);

// Register POST route for Supermarket
router.post("/register/supermarket", authController.registerSupermarket);
  
module.exports = router;
