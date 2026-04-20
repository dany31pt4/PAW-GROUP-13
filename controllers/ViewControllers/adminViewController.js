const User = require("../../models/user");
const Supermarket = require("../../models/supermarket");
const Order = require("../../models/order");
const Category = require("../../models/category");
const Product = require("../../models/product");
const supermarketService = require("../../utils/supermarketService");

const getDashboard = async (req, res) => {
  try {
    const [countActiveMarkets, pendingMarkets, totalOrders, totalUsers] =
      await Promise.all([
        Supermarket.countDocuments({ status: "approved" }),
        supermarketService.getPending(),
        Order.countDocuments(),
        User.countDocuments({ role: { $ne: "admin" } }),
      ]);

    res.render("admin/dashboard", {
      activePage: "dashboard",
      totalOrders,
      totalMarkets: countActiveMarkets,
      totalUsers,
      pendingMarkets,
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    res.status(500).render("error", {
      status: 500,
      message: "Erro ao carregar o dashboard.",
    });
  }
};

const getApprovals = async (req, res) => {
  const pendingListFromDB = await supermarketService.getPending();
  res.render("admin/approvals", {
    activePage: "approvals",
    pendingList: pendingListFromDB,
  });
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("supermarket", "name")
      .populate("courier", "name")
      .populate("products.product", "name")
      .sort({ createdAt: -1 });

    const salesByMarket = {};
    orders.forEach(o => {
      let name = "Desconhecido";
      if (o.supermarket) {
        name = o.supermarket.name;
      }
      salesByMarket[name] = (salesByMarket[name] || 0) + 1;
    });

    // Dados para gráfico: entregas por estafeta
    const deliveriesByCourier = {};
    orders.filter(o => o.courier).forEach(o => {
      const name = o.courier.name;
      deliveriesByCourier[name] = (deliveriesByCourier[name] || 0) + 1;
    });

    res.render("admin/orders", {
      activePage: "orders",
      orders,
      chartMarketLabels: JSON.stringify(Object.keys(salesByMarket)),
      chartMarketData: JSON.stringify(Object.values(salesByMarket)),
      chartCourierLabels: JSON.stringify(Object.keys(deliveriesByCourier)),
      chartCourierData: JSON.stringify(Object.values(deliveriesByCourier)),
    });
  } catch (error) {
    console.error("Erro ao carregar encomendas:", error);
    res.status(500).render("error", { status: 500, message: "Erro ao carregar encomendas." });
  }
};

const getUsers = async (req, res) => {
  try {
    const [adminsFromDB, supermarketsFromDB, couriersFromDB, customersFromDB] =
      await Promise.all([
        User.find({ role: "admin" }),
        Supermarket.find(),
        User.find({ role: "courier" }),
        User.find({ role: "customer" }),
      ]);
    const customersFinal = customersFromDB.map((customer) => {
      let dateFormatted = "---------";
      if (customer.createdAt) {
        dateFormatted = customer.createdAt.toLocaleDateString("pt-PT");
      }
      return {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        date: dateFormatted,
      };
    });
    const couriersFinal = await Promise.all(
      couriersFromDB.map(async (courier) => {
        const [lastOrder, total] = await Promise.all([
          Order.findOne({ courier: courier._id }).sort({ createdAt: -1 }),
          Order.countDocuments({ courier: courier._id }),
        ]);

        let lastOrderStatus = "------";
        let lastOrderDate = "------";

        if (lastOrder) {
          lastOrderStatus = lastOrder.status;
          lastOrderDate = lastOrder.createdAt.toLocaleDateString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        return {
          id: courier._id,
          name: courier.name,
          lastOrderStatus,
          lastOrderDate,
          totalDeliveries: total,
        };
      }),
    );

    res.render("admin/users", {
      activePage: "users",
      customers: customersFinal,
      markets: supermarketsFromDB,
      couriers: couriersFinal,
      admins: adminsFromDB,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("admin/categories", {
      activePage: "categories",
      categories,
    });
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
    res.status(500).render("error", {
      status: 500,
      message: "Erro ao carregar as categorias.",
    });
  }
};

const getAdminOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("customer", "name email")
      .populate("supermarket", "name")
      .populate("courier", "name")
      .populate("products.product", "name image");

    if (!order) {
      return res.status(404).render("error", { message: "Encomenda não encontrada.", error: { status: 404 } });
    }

    res.render("admin/order-detail", { activePage: "orders", order });
  } catch (error) {
    console.error("Erro ao carregar encomenda:", error);
    res.status(500).render("error", { message: "Erro ao carregar a encomenda.", error: { status: 500 } });
  }
};

const getAdminCategoryDetail = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).render("error", { message: "Categoria não encontrada.", error: { status: 404 } });
    }

    res.render("admin/category-detail", { activePage: "categories", category });
  } catch (error) {
    console.error("Erro ao carregar categoria:", error);
    res.status(500).render("error", { message: "Erro ao carregar a categoria.", error: { status: 500 } });
  }
};

const getAdminUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).render("error", { message: "Utilizador não encontrado.", error: { status: 404 } });
    }

    let courierStats = null;
    if (user.role === "courier") {
      const [total, recentOrders, lastOrder] = await Promise.all([
        Order.countDocuments({ courier: user._id }),
        Order.find({ courier: user._id })
          .populate("supermarket", "name")
          .sort({ createdAt: -1 })
          .limit(5),
        Order.findOne({ courier: user._id }).sort({ createdAt: -1 }),
      ]);
      let lastOrderDate = null;
      if (lastOrder) {
        lastOrderDate = lastOrder.createdAt.toLocaleDateString("pt-PT");
      }
      courierStats = {
        total,
        recentOrders,
        lastOrderDate,
      };
    }

    res.render("admin/user-detail", { activePage: "users", user, courierStats });
  } catch (error) {
    console.error("Erro ao carregar utilizador:", error);
    res.status(500).render("error", { message: "Erro ao carregar o utilizador.", error: { status: 500 } });
  }
};

const getAdminSupermarketDetail = async (req, res) => {
  try {
    const market = await Supermarket.findById(req.params.supermarketId).populate("user", "name email phone");

    if (!market) {
      return res.status(404).render("error", { message: "Supermercado não encontrado.", error: { status: 404 } });
    }

    let activePage = "users";
    if (market.status === "pending") {
      activePage = "approvals";
    }

    const [totalOrders, totalProducts, recentOrders] = await Promise.all([
      Order.countDocuments({ supermarket: market._id }),
      Product.countDocuments({ supermarket: market._id }),
      Order.find({ supermarket: market._id })
        .populate("customer", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.render("admin/supermarket-detail", {
      activePage,
      market,
      stats: { totalOrders, totalProducts, recentOrders },
    });
  } catch (error) {
    console.error("Erro ao carregar supermercado:", error);
    res.status(500).render("error", { message: "Erro ao carregar o supermercado.", error: { status: 500 } });
  }
};

const getAdminProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate("supermarket", "name _id")
      .populate("category", "name");

    if (!product) {
      return res.status(404).render("error", { message: "Produto não encontrado.", error: { status: 404 } });
    }

    res.render("admin/product-detail", {
      activePage: "products",
      product,
    });
  } catch (error) {
    console.error("Erro ao carregar produto:", error);
    res.status(500).render("error", { message: "Erro ao carregar o produto.", error: { status: 500 } });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("supermarket", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.render("admin/products", {
      activePage: "products",
      products,
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    res.status(500).render("error", { message: "Erro ao carregar os produtos.", error: { status: 500 } });
  }
};

module.exports = {
  getDashboard,
  getApprovals,
  getOrders,
  getUsers,
  getCategories,
  getProducts,
  getAdminOrderDetail,
  getAdminCategoryDetail,
  getAdminUserDetail,
  getAdminSupermarketDetail,
  getProducts,
  getAdminProductDetail,
};
