var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const marketController = require("../controllers/supermarketController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
var { verifyToken, verifyRole } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");


/*
=====
ADMIN ROUTES
=====
*/

router.post("/users/createAdmin", verifyToken, verifyRole(["admin"]), userController.createAdmin);
router.delete("/users/deleteAdmin/:id", verifyToken, verifyRole(["admin"]), userController.deleteAdmin);
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

router.post("/supermarkets/create", verifyToken, verifyRole(["admin"]), marketController.registerSupermarket);
router.get("/supermarkets/list", verifyToken, verifyRole(["admin"]), marketController.listSupermarkets);
router.get("/supermarkets/listPending", verifyToken, verifyRole(["admin"]), marketController.listPendingSupermarkets);
router.put("/supermarkets/approve/:id", verifyToken, verifyRole(["admin"]), marketController.approveSupermarket);
router.put("/supermarkets/reject/:id", verifyToken, verifyRole(["admin"]), marketController.rejectSupermarket);
router.put("/supermarkets/update/:id", verifyToken, verifyRole(["admin"]), marketController.updateSupermarket);
router.delete("/supermarkets/delete/:id", verifyToken, verifyRole(["admin"]), marketController.deleteSupermarket);
router.get("/supermarkets/:id", verifyToken, verifyRole(["admin"]), marketController.getSupermarketDetails);

/*
=====
CUSTOMER ROUTES
=====
*/

router.get("/customers/list", verifyToken, verifyRole(["admin"]), userController.listCustomers);
router.get("/customers/:id", verifyToken, verifyRole(["admin"]), userController.getCustomerById);
router.put("/customers/update/:id", verifyToken, verifyRole(["admin"]), userController.updateCustomer);
router.delete("/customers/delete/:id", verifyToken, verifyRole(["admin"]), userController.deleteCustomer);

/*
=====
CATEGORY ROUTES
=====
*/

router.post("/categories/create", verifyToken, verifyRole(["admin"]), categoryController.createCategory);
router.get("/categories/list", verifyToken, verifyRole(["admin"]), categoryController.listCategories);
router.put("/categories/update/:id", verifyToken, verifyRole(["admin"]), categoryController.updateCategory);
router.delete("/categories/delete/:id", verifyToken, verifyRole(["admin"]), categoryController.deleteCategory);
router.get("/categories/:id", verifyToken, verifyRole(["admin"]), categoryController.getCategoryById);

/*
=====
PRODUCT ROUTES
=====
*/

router.post("/product/create", verifyToken, verifyRole(["admin","supermarket"]), upload.single("image"), productController.createProduct);
router.get("/product/list/:id", verifyToken, verifyRole(["admin","supermarket"]), productController.listProduct);
router.put("/product/update/:id", verifyToken, verifyRole(["admin","supermarket"]), upload.single("image"), productController.updateProduct);
router.delete("/product/delete/:id", verifyToken, verifyRole(["admin","supermarket"]), productController.deleteProduct);
router.put("/product/toggle/:id", verifyToken, verifyRole(["admin","supermarket"]), productController.toggleProduct);





module.exports = router;
