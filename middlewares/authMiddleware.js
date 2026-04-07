const jwt = require("jsonwebtoken");

verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) res.redirect("/auth/login");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Guarda os dados do token (ex: id do utilizador)
    next(); // continues to the controller 
  } catch (erro) {
    console.error("Erro de autenticação:", erro);
    res.redirect("/auth/login");
  }
};

module.exports = {
  verifyToken,
};
