const Supermarket = require("../../models/supermarket");
const Product = require("../../models/product");
const Order = require("../../models/order");
const User = require("../../models/user");

const getDashboard = async (req, res) => {
  try {
    const supermarkets = await Supermarket.find({ status: "approved" }).sort({ name: 1 });
    res.render("customer/dashboard", { activePage: "dashboard", supermarkets });
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    res.status(500).render("error", { status: 500, message: "Erro ao carregar as lojas." });
  }
};

const getShop = async (req, res) => {
  try {
    const supermarket = await Supermarket.findOne({ _id: req.params.supermarketId, status: "approved" });
    if (!supermarket) {
      return res.status(404).render("error", { status: 404, message: "Supermercado não encontrado." });
    }

    const products = await Product.find({ supermarket: supermarket._id, isActive: true })
      .populate("category", "name")
      .sort({ name: 1 });

    const categories = [];
    const seen = new Set();
    products.forEach(function (p) {
      if (p.category && !seen.has(p.category._id.toString())) {
        seen.add(p.category._id.toString());
        categories.push(p.category);
      }
    });

    const user = await User.findById(req.user.id).select("address name");

    res.render("customer/shop", {
      activePage: "dashboard",
      supermarket,
      products,
      categories,
      user,
    });
  } catch (error) {
    console.error("Erro ao carregar loja:", error);
    res.status(500).render("error", { status: 500, message: "Erro ao carregar a loja." });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate("supermarket", "name")
      .sort({ createdAt: -1 });
    res.render("customer/orders", { activePage: "orders", orders });
  } catch (error) {
    console.error("Erro ao carregar encomendas:", error);
    res.status(500).render("error", { status: 500, message: "Erro ao carregar as encomendas." });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, customer: req.user.id })
      .populate("supermarket", "name")
      .populate("products.product", "name image")
      .populate("courier", "name")
      .populate("coupon", "code discountValue");
    if (!order) {
      return res.status(404).render("error", { status: 404, message: "Encomenda não encontrada." });
    }
    const canCancel = order.status === "pending" ||
      (order.status === "confirmed" && (Date.now() - new Date(order.updatedAt).getTime()) / 1000 / 60 <= 5);
    res.render("customer/order-detail", { activePage: "orders", order, canCancel });
  } catch (error) {
    console.error("Erro ao carregar encomenda:", error);
    res.status(500).render("error", { status: 500, message: "Erro ao carregar a encomenda." });
  }
};

module.exports = { getDashboard, getShop, getOrders, getOrderDetail };
