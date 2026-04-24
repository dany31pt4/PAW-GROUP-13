const express = require("express");
const router = express.Router();
const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");
const customerViewController = require("../controllers/ViewControllers/customerViewController");

router.use(verifyToken);
router.use(verifyRole(["customer"]));

router.get("/dashboard", customerViewController.getDashboard);
router.get("/shop/:supermarketId", customerViewController.getShop);
router.get("/orders", customerViewController.getOrders);
router.get("/order/:orderId", customerViewController.getOrderDetail);

module.exports = router;
