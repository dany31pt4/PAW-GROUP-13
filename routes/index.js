var express = require("express");
var router = express.Router();
var { verifyToken } = require("../middlewares/authMiddleware");
/* GET home page. */
router.get("/", verifyToken, function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
