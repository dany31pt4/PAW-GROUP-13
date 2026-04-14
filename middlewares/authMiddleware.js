const jwt = require("jsonwebtoken");
const Supermarket = require("../models/supermarket");
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
    console.log(req.user);
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

const verifySupermarketStatus = async (req, res, next) => {
  try {
  const supermarket = await Supermarket.findOne({ user: req.user.id });
      if (!supermarket) {
        return res.status(404).render("error", {
          message: "Supermercado não encontrado.",
          error: { status: 404 },
        });
      }
      console.log("Supermercado encontrado:", supermarket);
      if (supermarket.status === "pending") {
        return res.render("supermarket/pending", {
          supermarket,
          activePage: "dashboard",
          supermarketName: supermarket.name,
        });
      }
  
      if (supermarket.status === "rejected") {
        return res.render("supermarket/rejected", {
          supermarket,
          activePage: "dashboard",
          supermarketName: supermarket.name,
        });
      }

      next();
    } catch (error) {
      console.error("Erro ao verificar status do supermercado:", error);
      res.status(500).render("error", {
        message: "Erro ao verificar o status do supermercado.",
        error: { status: 500 },
      });
    }
}

module.exports = {
  verifyToken,
  verifyRole,
  verifySupermarketStatus,
};
