const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const secretKey = process.env.secret;
    const payload = jwt.verify(token, secretKey);
    req.user = payload; 
    next(); 
  } catch (erro) {
    console.error("Erro de autenticação:", erro);
    return res.redirect("/auth/login");
  }
};

module.exports = {
  verifyToken,
};