const express = require("express");
const router = express.Router();
const courierViewController = require("../controllers/viewControllers/courierViewController");
const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");

router.use(verifyToken);
router.use(verifyRole(["courier"]));

router.get("/dashboard", courierViewController.getDashboard);
router.get("/deliveries", courierViewController.getDeliveries);
router.get("/history", courierViewController.getHistory);
router.get("/order/:orderId", courierViewController.getOrderDetail);

module.exports = router;
