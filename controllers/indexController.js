const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const indexPage = async (req, res) => {
  const token = req.cookies.token;
  const secretKey = process.env.secret;
  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey); 
      const role = decoded.role;

      if (role === "admin") {
        return res.redirect("/admin/dashboard");
      } else if (role === "supermarket") {
        return res.redirect("/supermercado/dashboard");
      } else if (role === "courier") {
        return res.redirect("/estafeta/dashboard");
      }
   
    } catch (error) {
    
      res.clearCookie("token");
    }
  }


  res.redirect("/auth/login");
};
