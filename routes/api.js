var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
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
module.exports = router;
