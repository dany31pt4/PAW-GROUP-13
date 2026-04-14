var express = require("express");
var router = express.Router();
var { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, function (req, res) {
  const role = req.user.role;

  if (role === "admin") return res.redirect("/admin/dashboard");
  if (role === "supermarket") return res.redirect("/supermarket/dashboard");
  if (role === "courier") return res.redirect("/courier/dashboard");

  return res.redirect("/auth/login");
});

module.exports = router;
