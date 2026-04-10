var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const marketController = require("../controllers/supermarketController");
const categoryController = require("../controllers/categoryController");
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
router.get("/markets/list", marketController.listSupermarkets);
router.get("/markets/:id", marketController.getSupermarketById);
router.put("/markets/update/:id", marketController.updateSupermarket);
router.delete("/markets/delete/:id", marketController.deleteSupermarket);


//GET PENDING MARKETS
router.get("/markets/listPending", marketController.listPendingSupermarkets);

/*
=====
CUSTOMER ROUTES
=====
*/
router.get("/customer/listCustomers", verifyToken, verifyRole(["admin"]), userController.listCustomers);
router.get("/customer/:id", verifyToken, verifyRole(["admin"]), userController.getCustomerById);
router.put("/customer/update/:id", verifyToken, verifyRole(["admin"]), userController.updateCustomer);
router.delete("/customer/delete/:id", verifyToken, verifyRole(["admin"]), userController.deleteCustomer);


/*
=====
CATEGORY ROUTES
=====
*/
router.post("/category/create", verifyToken, verifyRole(["admin"]), categoryController.createCategory);
router.get("/categories/list", verifyToken, verifyRole(["admin"]), categoryController.listCategories);
router.get("/categories/:id", verifyToken, verifyRole(["admin"]), categoryController.getCategoryById);
router.put("/category/update/:id", verifyToken, verifyRole(["admin"]), categoryController.updateCategory);
router.delete("/category/delete/:id", verifyToken, verifyRole(["admin"]), categoryController.deleteCategory);
module.exports = router;
