var express = require("express");
var router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const supermarketController = require('../controllers/supermarketController');
//Render login page
router.get("/login", (req, res) => {
  res.render("auth/login", { erro: null });
});

//Render register page
router.get("/register", authController.renderRegisterPage);

// Register POST route for Supermarket
router.post("/register/supermarket", supermarketController.registerSupermarket);

// Register POST route for Courier
router.post("/register/courier", userController.registerCourier);

// Register POST route for Login
router.post("/login", authController.login);


// Register GET route for Logout
router.get("/logout", authController.logout);


module.exports = router;
