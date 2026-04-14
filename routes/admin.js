const express = require("express");
const router = express.Router();

const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");
const adminController = require("../controllers/viewControllers/adminViewController");
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

router.get("/dashboard", adminController.getDashboard);
router.get("/approvals", adminController.getApprovals);
router.get("/orders", adminController.getOrders);
router.get("/users", adminController.getUsers);
router.get("/categories", adminController.getCategories);

module.exports = router;