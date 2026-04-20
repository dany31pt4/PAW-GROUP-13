var express = require("express");
var router = express.Router();
var { verifyToken } = require("../middlewares/authMiddleware");
const { sendOrderStatusEmail } = require("../utils/emailService");

router.get("/", verifyToken, function (req, res) {
  const role = req.user.role;

  if (role === "admin") return res.redirect("/admin/dashboard");
  if (role === "supermarket") return res.redirect("/supermarket/dashboard");
  if (role === "courier") return res.redirect("/courier/dashboard");

  return res.redirect("/auth/login");
});

router.get("/test-email", async (req, res) => {
  await sendOrderStatusEmail({
    status: "confirmed",
    customer: { name: "Daniel", email: "8240310@estg.ipp.pt" },
    supermarket: { name: "Supermercado Teste" },
  });
  res.send("Email enviado! Verifica a caixa de entrada.");
});

module.exports = router;
