const express = require("express");
const router = express.Router();

const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");
const adminViewController = require("../controllers/viewControllers/adminViewController");
const Supermarket = require("../models/supermarket"); 

router.use(verifyToken);
router.use(verifyRole(["admin"]));
router.use(async (req, res, next) => {
    try {
        res.locals.adminName = req.user.name; 
        res.locals.allPending = await Supermarket.countDocuments({ status: "pending" });
        next();
    } catch (error) {
        next(error);
    }
});

router.get("/dashboard", adminViewController.getDashboard);
router.get("/approvals", adminViewController.getApprovals);
router.get("/orders", adminViewController.getOrders);
router.get("/users", adminViewController.getUsers);
router.get("/categories", adminViewController.getCategories);
router.get("/products", adminViewController.getProducts);
router.get("/product/:productId", adminViewController.getAdminProductDetail);
router.get("/order/:orderId", adminViewController.getAdminOrderDetail);
router.get("/category/:categoryId", adminViewController.getAdminCategoryDetail);
router.get("/user/:userId", adminViewController.getAdminUserDetail);
router.get("/supermarket/:supermarketId", adminViewController.getAdminSupermarketDetail);
router.get("/map", adminViewController.getMap);
router.get("/coupons", adminViewController.getCoupons);
router.get("/coupon/:couponId", adminViewController.getCouponDetail);

module.exports = router;