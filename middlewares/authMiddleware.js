const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const secretKey = process.env.secret;
    const payload = jwt.verify(token, secretKey);
    console.log(payload);
    req.user = payload;
    next();
  } catch (erro) {
    console.error("Erro de autenticação:", erro);
    return res.redirect("/auth/login");
  }
};

const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    console.log("Verificando role do usuário:", req.user.role);

    if (!req.user || !req.user.role) {
      return res.redirect("/auth/login");
    }

    console.log("Verificando role do usuário:", req.user.role);

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).render("error", {
        message:
          "Acesso Negado: Não tens permissões para aceder a esta página.",
        error: { status: 403 },
      });
    }
  };
};

module.exports = {
  verifyToken,
  verifyRole,
};
