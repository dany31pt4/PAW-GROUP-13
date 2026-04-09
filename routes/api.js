var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const marketController = require("../controllers/supermarketController");
var { verifyToken, verifyRole , listAdmins } = require("../middlewares/authMiddleware");


/*
=====
ADMIN ROUTES
=====
*/
router.post("/users/createAdmin",verifyToken,verifyRole(["admin"]),userController.createAdmin,);
router.delete("/users/deleteAdmin/:id",verifyToken,verifyRole(["admin"]),userController.deleteAdmin,);
router.get("/users/listAdmins", verifyToken, verifyRole(["admin"]), userController.listAdmins);
router.get("/users/admin/:id", verifyToken, verifyRole(["admin"]), userController.getAdminById);
router.put("/users/updateAdmin/:id", verifyToken, verifyRole(["admin"]), userController.updateAdmin);

/*
=====
COURIER ROUTES
=====
*/
router.get("/users/listCouriers", verifyToken, verifyRole(["admin"]), userController.listCouriers);
router.post("/users/createCourier", verifyToken, verifyRole(["admin"]), userController.createCourier);
router.get("/users/courier/:id", verifyToken, verifyRole(["admin"]), userController.getCourierById);
router.put("/users/updateCourier/:id", verifyToken, verifyRole(["admin"]), userController.updateCourier);
router.delete("/users/deleteCourier/:id", verifyToken, verifyRole(["admin"]), userController.deleteCourier);



/*
=====
SUPERMARKET ROUTES
=====
*/


// Criar (POST) - /api/markets/create
router.post("/markets/create", marketController.registerSupermarket);

// Listar todos (GET) - /api/markets/list
router.get("/markets/list", marketController.listSupermarkets);

// Buscar um por ID (GET) - /api/markets/:id
router.get("/markets/:id", marketController.getSupermarketById);

// Atualizar (PUT) - /api/markets/update/:id
router.put("/markets/update/:id", marketController.updateSupermarket);

// Eliminar (DELETE) - /api/markets/delete/:id
router.delete("/markets/delete/:id", marketController.deleteSupermarket);



/*
=====
CUSTOMER ROUTES
=====
*/

router.get("/customer/listCustomers", verifyToken, verifyRole(["admin"]), userController.listCustomers);
router.get("/customer/:id", verifyToken, verifyRole(["admin"]), userController.getCustomerById);
router.put("/customer/update/:id", verifyToken, verifyRole(["admin"]), userController.updateCustomer);
router.delete("/customer/delete/:id", verifyToken, verifyRole(["admin"]), userController.deleteCustomer);
module.exports = router;
