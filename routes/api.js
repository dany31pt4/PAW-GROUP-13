var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
var { verifyToken, verifyRole , listAdmins } = require("../middlewares/authMiddleware");

router.post("/users/createAdmin",verifyToken,verifyRole(["admin"]),userController.createAdmin,);
router.delete("/users/deleteAdmin/:id",verifyToken,verifyRole(["admin"]),userController.deleteAdmin,);
router.get("/users/listAdmins", verifyToken, verifyRole(["admin"]), userController.listAdmins);
router.get("/users/admin/:id", verifyToken, verifyRole(["admin"]), userController.getAdminById);
router.put("/users/updateAdmin/:id", verifyToken, verifyRole(["admin"]), userController.updateAdmin);
module.exports = router;
