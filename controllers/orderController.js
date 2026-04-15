const orderService = require("../utils/orderService");
const userService = require("../utils/userService");
const Order = require("../models/order");
const Product = require("../models/product");
const Supermarket = require("../models/supermarket");
const User = require("../models/user");

// Venda em caixa (M1) — backoffice do supermercado
const createSaleOrder = async (req, res) => {
  try {
    const { customerId, products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Produtos são obrigatórios." });
    }

    // Verificar que o cliente existe
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Cliente não encontrado." });
    }

    const orderProducts = [];
    let total = 0;

    for (item of products) {
      const doc = await Product.findById(item.productId);
      if (!doc) {
        return res.status(404).json({ success: false, message: "Produto não encontrado." });
      }
      if (doc.supermarket.toString() !== req.user.supermarket_id.toString()) {
        return res.status(400).json({ success: false, message: `Produto ${doc.name} não pertence a este supermercado.` });
      }
      if (doc.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stock insuficiente para ${doc.name}.` });
      }

      orderProducts.push({ product: doc._id, quantity: item.quantity, unitPrice: doc.price });
      total += doc.price * item.quantity;
    }

    const newOrder = await orderService.createOrder({
      customer: customerId,
      supermarket: req.user.supermarket_id,
      products: orderProducts,
      deliveryMethod: "pickup",
      deliveryCost: 0,
      total,
      status: "confirmed",
    });

    for (item of orderProducts) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error("Erro ao registar venda:", error.message);
    res.status(500).json({ success: false, message: "Erro ao registar venda." });
  }
};

// Encomenda online pelo cliente (M2)
const createOrder = async (req, res) => {
  try {
  } catch (error) {
    console.error("Erro ao criar encomenda:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Erro ao criar encomenda." });
  }
};

// Obter detalhes de uma encomenda pelo id
const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Encomenda não encontrada." });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Erro ao obter encomenda:", error.message);
    res.status(500).json({ success: false, message: "Erro ao obter encomenda." });
  }
};

// Listar encomendas de um cliente (histórico de compras)
const getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByCustomer(req.params.id);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Erro ao listar encomendas:", error.message);
    res.status(500).json({ success: false, message: "Erro ao listar encomendas." });
  }
};

// Listar encomendas recebidas por um supermercado
const getOrdersBySupermarket = async (req, res) => {
  try {
    const orders = await orderService.getOrdersBySupermarket(req.params.id);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Erro ao listar encomendas:", error.message);
    res.status(500).json({ success: false, message: "Erro ao listar encomendas." });
  }
};

// Listar todas as encomendas (apenas admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Erro ao listar encomendas:", error.message);
    res.status(500).json({ success: false, message: "Erro ao listar encomendas." });
  }
};

// Atualizar o estado de uma encomenda
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "preparing", "delivering", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Estado inválido." });
    }

    const order = await orderService.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ success: false, message: "Encomenda não encontrada." });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Erro ao atualizar estado:", error.message);
    res.status(500).json({ success: false, message: "Erro ao atualizar estado." });
  }
};

// Cancelar encomenda — só até 5 minutos após confirmação, repõe stock
const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Encomenda não encontrada." });

    if (order.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Encomenda já foi cancelada." });
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      return res.status(400).json({ success: false, message: "Encomenda não pode ser cancelada neste estado." });
    }

    if (order.status === "confirmed") {
                                                              // da em milisegundo /1000 converte para segundo /60 para minutos
      const diffMin = (Date.now() - new Date(order.updatedAt).getTime()) / 1000 / 60;
      if (diffMin > 5) {
        return res.status(400).json({ success: false, message: "Prazo de cancelamento expirado (5 minutos)." });
      }
    }

    for ( item of order.products) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: item.quantity } });
    }

    const cancelled = await orderService.updateOrderStatus(req.params.id, "cancelled");
    res.status(200).json({ success: true, data: cancelled });
  } catch (error) {
    console.error("Erro ao cancelar encomenda:", error.message);
    res.status(500).json({ success: false, message: "Erro ao cancelar encomenda." });
  }
};

module.exports = {
  createSaleOrder,
  createOrder,
  getOrderById,
  getOrdersByCustomer,
  getOrdersBySupermarket,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
