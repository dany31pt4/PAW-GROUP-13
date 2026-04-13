const User = require("../models/user");
const Supermarket = require("../models/supermarket");
const Order = require("../models/order");
const Category = require("../models/category");
const supermarketService = require("../utils/supermarketService");

const getDashboard = async (req, res) => {
  const [countActiveMarkets, pendingMarkets, totalOrders, totalUsers] = await Promise.all([
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
};

const getApprovals = async (req, res) => {
  const pendingListFromDB = await supermarketService.getPending();
  res.render("admin/approvals", {
    activePage: "approvals",
    pendingList: pendingListFromDB,
  });
};

const getOrders = (req, res) => {
  res.render("admin/orders", {
    activePage: "orders",
    listaEncomendas: [],
  });
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

    const customersFinal = customersFromDB.map((customer) => ({
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      date: customer.createdAt
        ? customer.createdAt.toLocaleDateString("pt-PT")
        : "---------",
    }));

    const couriersFinal = await Promise.all(
      couriersFromDB.map(async (courier) => {
        const [lastOrder, total] = await Promise.all([
          Order.findOne({ courier: courier._id }).sort({ createdAt: -1 }),
          Order.countDocuments({ courier: courier._id }),
        ]);

        return {
          id: courier._id,
          name: courier.name,
          lastOrderStatus: lastOrder ? lastOrder.status : "------",
          lastOrderDate: lastOrder
            ? lastOrder.createdAt.toLocaleDateString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "------",
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
  const categories = await Category.find();

  res.render("admin/categories", {
    activePage: "categories",
    categories: categories,
  });
};

module.exports = {
  getDashboard,
  getApprovals,
  getOrders,
  getUsers,
  getCategories,
};
