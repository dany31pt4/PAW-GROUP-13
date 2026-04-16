const User = require("../../models/user");
const Supermarket = require("../../models/supermarket");
const Order = require("../../models/order");
const Category = require("../../models/category");
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

    // Dados para gráfico: vendas por supermercado
    const salesByMarket = {};
    orders.forEach(o => {
      const name = o.supermarket ? o.supermarket.name : "Desconhecido";
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

module.exports = {
  getDashboard,
  getApprovals,
  getOrders,
  getUsers,
  getCategories,
};
