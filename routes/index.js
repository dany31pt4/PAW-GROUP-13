var express = require("express");
var router = express.Router();
var { verifyToken } = require("../middlewares/authMiddleware");
/* GET home page. */
router.get("/", verifyToken, function (req, res, next) {
  res.redirect("/admin/dashboard");
});

router.get("/index", verifyToken, function (req, res, next) {
  res.render("/admin/dashboard", { title: "Express" });
});

module.exports = router;
