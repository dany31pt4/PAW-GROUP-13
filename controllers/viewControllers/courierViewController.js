const Order = require("../../models/order");

const getDashboard = async (req, res) => {
  try {
    const courierId = req.user.id;

    const [totalDeliveries, activeDelivery, availableDeliveries, recentDeliveries] = await Promise.all([
      Order.countDocuments({ courier: courierId, status: "delivered" }),
      Order.findOne({ courier: courierId, status: "delivering" })
        .populate("customer", "name")
        .populate("supermarket", "name"),
      Order.find({ status: "awaiting_courier", courier: { $exists: false } })
        .populate("customer", "name")
        .populate("supermarket", "name")
        .sort({ createdAt: 1 })
        .limit(5),
      Order.find({ courier: courierId, status: "delivered" })
        .populate("supermarket", "name")
        .populate("customer", "name")
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

    const deliveredOrders = await Order.find({ courier: courierId, status: "delivered" })
      .populate("supermarket", "name");

    const topSupermarkets = [];
    for (const order of deliveredOrders) {
      if (!order.supermarket) continue;
      let found = false;
      for (let i = 0; i < topSupermarkets.length; i++) {
        if (topSupermarkets[i].id === order.supermarket._id.toString()) {
          topSupermarkets[i].count++;
          found = true;
          break;
        }
      }
      if (!found) {
        topSupermarkets.push({ id: order.supermarket._id.toString(), name: order.supermarket.name, count: 1 });
      }
    }
    topSupermarkets.sort((a, b) => b.count - a.count);
    topSupermarkets.splice(5); //apenas os primeiros 5

    res.render("courier/dashboard", {
      activePage: "dashboard",
      courierName: req.user.name,
      totalDeliveries,
      activeDelivery,
      availableDeliveries,
      availableCount: availableDeliveries.length,
      recentDeliveries,
      topSupermarkets,
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard do estafeta:", error);
    res.status(500).render("error", { message: "Erro ao carregar o dashboard.", error: { status: 500 } });
  }
};

const getDeliveries = async (req, res) => {
  try {
    const courierId = req.user.id;

    const [activeDelivery, availableDeliveries] = await Promise.all([
      Order.findOne({ courier: courierId, status: "delivering" })
        .populate("customer", "name address")
        .populate("supermarket", "name"),
      Order.find({ status: "awaiting_courier", courier: { $exists: false } })
        .populate("customer", "name address")
        .populate("supermarket", "name")
        .populate("products.product", "name")
        .sort({ createdAt: 1 }),
    ]);

    res.render("courier/deliveries", {
      activePage: "deliveries",
      courierName: req.user.name,
      activeDelivery,
      availableDeliveries,
    });
  } catch (error) {
    console.error("Erro ao carregar entregas:", error);
    res.status(500).render("error", { message: "Erro ao carregar as entregas.", error: { status: 500 } });
  }
};

const getHistory = async (req, res) => {
  try {
    const deliveries = await Order.find({ courier: req.user.id, status: "delivered" })
      .populate("supermarket", "name")
      .populate("customer", "name address")
      .populate("products.product", "name")
      .sort({ updatedAt: -1 });

    res.render("courier/history", {
      activePage: "history",
      courierName: req.user.name,
      deliveries,
    });
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    res.status(500).render("error", { message: "Erro ao carregar o histórico.", error: { status: 500 } });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("customer", "name email")
      .populate("supermarket", "name")
      .populate("products.product", "name image");

    if (!order) {
      return res.status(404).render("error", { message: "Encomenda não encontrada.", error: { status: 404 } });
    }

    let activePage = "history";
    let backUrl = "/courier/history";
    if (order.status === "delivering" || order.status === "awaiting_courier") {
      activePage = "deliveries";
      backUrl = "/courier/deliveries";
    }

    res.render("courier/order-detail", {
      activePage,
      backUrl,
      order,
    });
  } catch (error) {
    console.error("Erro ao carregar encomenda:", error);
    res.status(500).render("error", { message: "Erro ao carregar a encomenda.", error: { status: 500 } });
  }
};

module.exports = { getDashboard, getDeliveries, getHistory, getOrderDetail };
