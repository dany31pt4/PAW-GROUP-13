const express = require("express");
const router = express.Router();
const supermarketViewController = require("../controllers/viewControllers/supermarketViewController");
const { verifyToken, verifyRole, verifySupermarketStatus } = require("../middlewares/authMiddleware");

router.use(verifyToken);
router.use(verifyRole(["supermarket"]));


router.get("/dashboard",verifySupermarketStatus, supermarketViewController.getDashboard);
router.get("/settings", supermarketViewController.getSettings);
router.get("/products",verifySupermarketStatus, supermarketViewController.getProducts);
router.get("/orders",verifySupermarketStatus, supermarketViewController.getOrders);
router.get("/newsale",verifySupermarketStatus, supermarketViewController.getNewSale);

module.exports = router;
