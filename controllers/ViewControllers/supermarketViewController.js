const Supermarket = require("../../models/supermarket");
const Order = require("../../models/order");
const Product = require("../../models/product");
const User = require("../../models/user");
const Category = require("../../models/category");

const getDashboard = async (req, res) => {
  try {
    const supermarket = await Supermarket.findOne({ user: req.user.id });
    const [totalOrders, totalProducts] = await Promise.all([
      Order.countDocuments({ supermarket: supermarket._id }),
      Product.countDocuments({ supermarket: supermarket._id }),
    ]);


    res.render("supermarket/dashboard", {
      activePage: "dashboard",
      supermarketStatus: supermarket.status,

      supermarketName: supermarket.name,
      totalOrders,
      totalProducts,
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard do supermercado:", error);
    res.status(500).render("error", {
      message: "Erro ao carregar o dashboard.",
      error: { status: 500 },
    });
  }
};

const getSettings = async (req, res) => {
  try {
    const supermarket = await Supermarket.findOne({ user: req.user.id });
    const user = await User.findById(req.user.id).select("-password");
    res.render("supermarket/settings", {
      activePage: "settings",
      user: user,
      supermarket: supermarket,
    });
  } catch (error) {
    console.error("Erro ao carregar settings:", error);
    res.status(500).render("error", {
      message: "Erro ao carregar as definições.",
      error: { status: 500 },
    });
  }
};
const getProducts = async (req, res) => {
  try {
    const supermarket = await Supermarket.findOne({ user: req.user.id });
    const [products, categories] = await Promise.all([
      Product.find({ supermarket: supermarket._id })
        .populate("category")
        .sort({ name: 1 }),
      Category.find({ status: true }),
    ]);

    res.render("supermarket/products", {
      activePage: "products",
      supermarket,
      products,
      categories,
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    res.status(500).render("error", {
      message: "Erro ao carregar os produtos.",
      error: { status: 500 },
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const supermarket = await Supermarket.findOne({ user: req.user.id });

    const orders = await Order.find({ supermarket: supermarket._id })
      .populate("customer", "name email")
      .populate("products.product", "name")
      .sort({ createdAt: -1 });

    res.render("supermarket/orders", {
      activePage: "orders",
      supermarket,
      orders,
    });
  } catch (error) {
    console.error("Erro ao carregar encomendas:", error);
    res.status(500).render("error", {
      message: "Erro ao carregar as encomendas.",
      error: { status: 500 },
    });
  }
};

const getNewSale = async (req, res) => {
  try {
    const supermarket = await Supermarket.findOne({ user: req.user.id });

    const [products, categories] = await Promise.all([
      Product.find({ supermarket: supermarket._id, stock: { $gt: 0 }, isActive: true })
        .populate("category")
        .sort({ name: 1 }),
      Category.find({ status: true }),
    ]);

    res.render("supermarket/newsale", {
      activePage: "newsale",
      supermarket,
      products,
      categories,
    });
  } catch (error) {
    console.error("Erro ao carregar nova venda:", error);
    res.status(500).render("error", {
      message: "Erro ao carregar a página de nova venda.",
      error: { status: 500 },
    });
  }
};

module.exports = {
  getDashboard,
  getSettings,
  getProducts,
  getOrders,
  getNewSale,
};
