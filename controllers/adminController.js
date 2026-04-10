const User = require("../models/user");
const Supermarket = require("../models/supermarket");
const Order = require("../models/order");
const Category = require("../models/category");
const getDashboard = (req, res) => {
  res.render("admin/dashboard", {
    activePage: "dashboard",
    adminName: req.user.name,
    totalOrders: 42,
    totalMarkets: 12,
    allPending: 3,
    totalComplaints: 1,
    pendingMarkets: [
      {
        _id: "1",
        name: "Supermercado Modelo Bragança",
        email: "contacto@modelo.pt",
        location: "Bragança",
      },
      {
        _id: "2",
        name: "Talho do Zé",
        email: "ze@talho.pt",
        location: "Mirandela",
      },
    ],
  });
};

// Função para a página de Aprovações
const getApprovals = (req, res) => {
  res.render("admin/approvals", {
    activePage: "approvals",
    allPending: 3,
    adminName: "Francisco Bernardo",
    pendingList: [
      {
        name: "Mini Preço Central",
        type: "Supermercado",
        email: "loja@minipreco.pt",
        location: "Maia",
      },
      {
        name: "João Entregas",
        type: "Estafeta",
        email: "joao@email.com",
        location: "Porto",
      },
      {
        name: "Frutaria da Maria",
        type: "Supermercado",
        email: "maria@frutas.pt",
        location: "Gaia",
      },
    ],
  });
};

// Função para a página de Encomendas
const getOrders = (req, res) => {
  res.render("admin/orders", {
    activePage: "orders",
    adminName: "Francisco Bernardo",
    allPending: 3,
    listaEncomendas: [
      {
        id: "1024",
        client: "Maria Silva",
        market: "Pingo Doce",
        value: "45.20",
        state: "Entregue",
      },
      {
        id: "1025",
        client: "José Santos",
        market: "Continente",
        value: "12.80",
        state: "Pendente",
      },
      {
        id: "1026",
        client: "Carla Dias",
        market: "Lidl",
        value: "89.00",
        state: "Entregue",
      },
    ],
  });
};

// Função para a página de Utilizadores (com a lógica da BD)
const getUsers = async (req, res) => {
  try {
    const adminsFromDB = await User.find({ role: "admin" });
    const supermarketsFromDB = await Supermarket.find();
    const couriersFromDB = await User.find({ role: "courier" });
    const customersFromDB = await User.find({ role: "customer" });

    const customersFinal = customersFromDB.map((customer) => {
      let dataFormatada = "---------";
      // converter a  data
      if (customer.createdAt) {
        newDate = customer.createdAt.toLocaleDateString("pt-PT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
      return {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        date: newDate,
      };
    });

    const couriersFinal = [];
    for (const courier of couriersFromDB) {
      const lastOrder = await Order.findOne({ courier: courier._id }).sort({
        createdAt: -1,
      });
      const total = await Order.countDocuments({ courier: courier._id });

      let lastOrderStatus = "------";
      let lastOrderDate = "------";

      if (lastOrder) {
        lastOrderStatus = lastOrder.status;
        lastOrderDate = lastOrder.createdAt.toLocaleDateString("pt-PT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      couriersFinal.push({
        id: courier._id,
        name: courier.name,
        lastOrderStatus: lastOrderStatus,
        lastOrderDate: lastOrderDate,
        totalDeliveries: total,
      });
    }
    console.log(couriersFinal);
    res.render("admin/users", {
      activePage: "users",
      adminName: req.user.name,
      allPending: 3,
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
  console.log(categories);
  res.render("admin/categories", {
    activePage: "categories",
    adminName: req.user.name,
    allPending: 3,
    categories: categories,
  });
};



// Exportamos tudo para usar nas rotas
module.exports = {
  getDashboard,
  getApprovals,
  getOrders,
  getUsers,
  getCategories,
};
