const jwt = require("jsonwebtoken");

const isAjaxRequest = (req) => {
  return (
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes("application/json"))
  );
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    if (isAjaxRequest(req)) {
      return res
        .status(401)
        .json({ success: false, message: "Sem permissões." });
    }
    return res.redirect("/auth/login");
  }

  try {
    const secretKey = process.env.secret;
    const payload = jwt.verify(token, secretKey);
    req.user = payload;
    next();
  } catch (erro) {
    console.error("Erro de autenticação:", erro);

    if (isAjaxRequest(req)) {
      return res
        .status(401)
        .json({ success: false, message: "Sem permissões." });
    }
    return res.redirect("/auth/login");
  }
};

const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      if (isAjaxRequest(req)) {
        return res
          .status(401)
          .json({ success: false, message: "Utilizador não identificado." });
      }
      return res.redirect("/auth/login");
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      if (isAjaxRequest(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Acesso Negado: Não tens permissões para realizar esta ação.",
        });
      }
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
