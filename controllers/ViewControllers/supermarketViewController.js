const Supermarket = require("../../models/supermarket");
const Order = require("../../models/order");
const Product = require("../../models/product");
const User = require("../../models/user");
const Category = require("../../models/category");

const getDashboard = async (req, res) => {
  try {
    const supermarket = await Supermarket.findOne({ user: req.user.id });
    const [totalOrders, totalProducts, recentOrders] = await Promise.all([
      Order.countDocuments({ supermarket: supermarket._id }),
      Product.countDocuments({ supermarket: supermarket._id }),
      Order.find({ supermarket: supermarket._id, status: "confirmed" })
        .populate("customer", "name")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.render("supermarket/dashboard", {
      activePage: "dashboard",
      supermarketStatus: supermarket.status,
      supermarketName: supermarket.name,
      totalOrders,
      totalProducts,
      recentOrders,
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
      pendingMode: supermarket.status === "pending",
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

const getOrderDetail = async (req, res) => {
  try {
    const supermarket = await Supermarket.findOne({ user: req.user.id });
    const order = await Order.findOne({
      _id: req.params.orderId,
      supermarket: supermarket._id,
    })
      .populate("customer", "name email")
      .populate("products.product", "name image");

    if (!order) {
      return res.status(404).render("error", {
        message: "Encomenda não encontrada.",
        error: { status: 404 },
      });
    }

    res.render("supermarket/order-detail", {
      activePage: "orders",
      supermarket,
      order,
    });
  } catch (error) {
    console.error("Erro ao carregar detalhe da encomenda:", error);
    res.status(500).render("error", {
      message: "Erro ao carregar a encomenda.",
      error: { status: 500 },
    });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const supermarket = await Supermarket.findOne({ user: req.user.id });
    const product = await Product.findOne({
      _id: req.params.productId,
      supermarket: supermarket._id,
    }).populate("category");

    if (!product) {
      return res.status(404).render("error", {
        message: "Produto não encontrado.",
        error: { status: 404 },
      });
    }

    res.render("supermarket/product-detail", {
      activePage: "products",
      supermarket,
      product,
    });
  } catch (error) {
    console.error("Erro ao carregar detalhe do produto:", error);
    res.status(500).render("error", {
      message: "Erro ao carregar o produto.",
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
  getProductDetail,
  getOrderDetail,
};
