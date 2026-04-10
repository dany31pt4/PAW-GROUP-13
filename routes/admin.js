var express = require("express");
var router = express.Router();

// Importar middlewares
var { verifyToken, verifyRole } = require("../middlewares/authMiddleware");

// Importar o novo controlador
var adminController = require("../controllers/adminController");

// Rotas limpas a apontar para as funções do controlador
router.get("/dashboard", verifyToken, verifyRole(["admin"]), adminController.getDashboard);
router.get("/approvals", verifyToken, verifyRole(["admin"]), adminController.getApprovals);
router.get("/orders", verifyToken, verifyRole(["admin"]), adminController.getOrders);
router.get("/users", verifyToken, verifyRole(["admin"]), adminController.getUsers);
router.get("/categories", verifyToken, verifyRole(["admin"]), adminController.getCategories);


module.exports = router;