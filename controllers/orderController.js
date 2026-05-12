const orderService = require("../utils/orderService");
const userService = require("../utils/userService");
const Order = require("../models/order");
const Product = require("../models/product");
const Supermarket = require("../models/supermarket");
const Coupon = require("../models/coupon");
const User = require("../models/user");
const { sendOrderStatusEmail, sendCourierAvailableEmail } = require("../utils/emailService");

const createSaleOrder = async (req, res) => {
  try {
    const { customerId, products, deliveryMethod = "pickup", deliveryCost = 0, deliveryAddress, couponCode } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Produtos são obrigatórios." });
    }

    const supermarket = await Supermarket.findById(req.user.supermarket_id);
    if (!supermarket.deliveryMethods || !supermarket.deliveryMethods.includes(deliveryMethod)) {
      let label = "levantamento em loja";
      if (deliveryMethod === "courier") {
        label = "entrega por estafeta";
      }
      return res.status(400).json({ success: false, message: `Este supermercado não tem ${label} ativo.` });
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Cliente não encontrado." });
    }

    const orderProducts = [];
    let total = 0;

    for (const item of products) {
      const doc = await Product.findById(item.productId);
      if (!doc) {
        return res.status(404).json({ success: false, message: "Produto não encontrado." });
      }
      if (doc.supermarket.toString() !== req.user.supermarket_id.toString()) {
        return res.status(400).json({ success: false, message: `Produto ${doc.name} não pertence a este supermercado.` });
      }
      if (!doc.isActive) {
        return res.status(400).json({ success: false, message: `Produto ${doc.name} está desativado.` });
      }
      if (doc.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stock insuficiente para ${doc.name}.` });
      }

      orderProducts.push({ product: doc._id, quantity: item.quantity, unitPrice: doc.price });
      total += doc.price * item.quantity;
    }

    let finalDeliveryCost = 0;
    if (deliveryMethod === "courier") {
      finalDeliveryCost = deliveryCost;
    }

    let discount = 0;
    let couponDoc = null;
    if (couponCode) {
      couponDoc = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        active: true,
        supermarket: req.user.supermarket_id,
      });
      if (couponDoc && !(couponDoc.expiresAt && couponDoc.expiresAt < new Date()) && !(couponDoc.maxUses > 0 && couponDoc.usedCount >= couponDoc.maxUses)) {
        discount = parseFloat((total * couponDoc.discountValue / 100).toFixed(2));
      }
    }

    let orderStatus = "confirmed";
    if (deliveryMethod === "pickup") {
      orderStatus = "delivered";
    }

    const newOrder = await orderService.createOrder({
      customer: customerId,
      supermarket: req.user.supermarket_id,
      products: orderProducts,
      deliveryMethod,
      deliveryCost: finalDeliveryCost,
      discount,
      coupon: couponDoc?._id || null,
      total: parseFloat((total - discount).toFixed(2)),
      status: orderStatus,
    });

    if (couponDoc) {
      await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } });
    }

    for (const item of orderProducts) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    if (deliveryMethod === "courier" && deliveryAddress) {
      await User.findByIdAndUpdate(customerId, { address: deliveryAddress });
    }

    const populatedOrder = await orderService.getOrderById(newOrder._id);
    await sendOrderStatusEmail(populatedOrder);

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error("Erro ao registar venda:", error.message);
    res.status(500).json({ success: false, message: "Erro ao registar venda." });
  }
};

// Encomenda online pelo cliente
const createOrder = async (req, res) => {
  try {
    const { supermarketId, products, deliveryMethod = "pickup", deliveryAddress, couponCode } = req.body;

    if (!supermarketId || !products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Supermercado e produtos são obrigatórios." });
    }

    const supermarket = await Supermarket.findById(supermarketId);
    if (!supermarket || supermarket.status !== "approved") {
      return res.status(404).json({ success: false, message: "Supermercado não encontrado." });
    }

    if (!supermarket.deliveryMethods || !supermarket.deliveryMethods.includes(deliveryMethod)) {
      let label = "levantamento em loja";
      if (deliveryMethod === "courier") label = "entrega por estafeta";
      return res.status(400).json({ success: false, message: `Este supermercado não tem ${label} ativo.` });
    }

    const orderProducts = [];
    let total = 0;

    for (const item of products) {
      const doc = await Product.findById(item.productId);
      if (!doc) return res.status(404).json({ success: false, message: "Produto não encontrado." });
      if (doc.supermarket.toString() !== supermarketId) {
        return res.status(400).json({ success: false, message: "Produto não pertence a este supermercado." });
      }
      if (!doc.isActive) return res.status(400).json({ success: false, message: `Produto "${doc.name}" está desativado.` });
      if (doc.stock < item.quantity) return res.status(400).json({ success: false, message: `Stock insuficiente para "${doc.name}".` });

      orderProducts.push({ product: doc._id, quantity: item.quantity, unitPrice: doc.price });
      total += doc.price * item.quantity;
    }

    let finalDeliveryCost = 0;
    if (deliveryMethod === "courier") {
      finalDeliveryCost = supermarket.deliveryCost || 0;
    }

    let discount = 0;
    let couponDoc = null;
    if (couponCode) {
      couponDoc = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        active: true,
        supermarket: supermarketId,
      });
      if (couponDoc) {
        const expired = couponDoc.expiresAt && couponDoc.expiresAt < new Date();
        const maxuses = couponDoc.maxUses > 0 && couponDoc.usedCount >= couponDoc.maxUses;
        if (!expired && !maxuses) {
          discount = parseFloat((total * couponDoc.discountValue / 100).toFixed(2));
        }
      }
    }

    const newOrder = await orderService.createOrder({
      customer: req.user.id,
      supermarket: supermarketId,
      products: orderProducts,
      deliveryMethod,
      deliveryCost: finalDeliveryCost,
      deliveryAddress: deliveryMethod === "courier" ? (deliveryAddress || null) : null,
      discount,
      coupon: couponDoc ? couponDoc._id : null,
      total: parseFloat((total - discount).toFixed(2)),
      status: "pending",
    });

    if (couponDoc) {
      await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } });
    }

    for (const item of orderProducts) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const populatedOrder = await orderService.getOrderById(newOrder._id);
    await sendOrderStatusEmail(populatedOrder);

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error("Erro ao criar encomenda:", error.message);
    res.status(500).json({ success: false, message: "Erro ao criar encomenda." });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByCustomer(req.user.id);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao listar encomendas." });
  }
};

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

const getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByCustomer(req.params.id);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Erro ao listar encomendas:", error.message);
    res.status(500).json({ success: false, message: "Erro ao listar encomendas." });
  }
};

const getOrdersBySupermarket = async (req, res) => {
  try {
    const orders = await orderService.getOrdersBySupermarket(req.params.id);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Erro ao listar encomendas:", error.message);
    res.status(500).json({ success: false, message: "Erro ao listar encomendas." });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Erro ao listar encomendas:", error.message);
    res.status(500).json({ success: false, message: "Erro ao listar encomendas." });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "preparing", "awaiting_courier", "delivering", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Estado inválido." });
    }

    const order = await orderService.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ success: false, message: "Encomenda não encontrada." });

    const orderPopulated = await orderService.getOrderById(order._id);
    await sendOrderStatusEmail(orderPopulated);

    if (status === "awaiting_courier") {
      const activeCourierIds = await Order.find({ status: "delivering" }).distinct("courier");
      const availableCouriers = await User.find({ role: "courier", _id: { $nin: activeCourierIds } }).select("email name");
      await sendCourierAvailableEmail(availableCouriers, orderPopulated);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Erro ao atualizar estado:", error.message);
    res.status(500).json({ success: false, message: "Erro ao atualizar estado." });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Encomenda não encontrada." });

    //PARA 2º MILESTONE
    if (req.user.role === "customer" && order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Sem permissão para cancelar esta encomenda." });
    }

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

    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: item.quantity } });
    }

    const cancelled = await orderService.updateOrderStatus(req.params.id, "cancelled");
    const cancelledPopulated = await orderService.getOrderById(cancelled._id);
    await sendOrderStatusEmail(cancelledPopulated);
    res.status(200).json({ success: true, data: cancelled });
  } catch (error) {
    console.error("Erro ao cancelar encomenda:", error.message);
    res.status(500).json({ success: false, message: "Erro ao cancelar encomenda." });
  }
};

const acceptDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Encomenda não encontrada." });

    if (order.status !== "awaiting_courier" || order.courier) {
      return res.status(400).json({ success: false, message: "Entrega não disponível." });
    }

    const alreadyActive = await Order.findOne({ courier: req.user.id, status: "delivering" });
    if (alreadyActive) {
      return res.status(400).json({ success: false, message: "Já tens uma entrega em curso." });
    }

    order.courier = req.user.id;
    order.status = "delivering";
    await order.save();

    const orderPopulated = await orderService.getOrderById(order._id);
    await sendOrderStatusEmail(orderPopulated);

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Erro ao aceitar entrega:", error.message);
    res.status(500).json({ success: false, message: "Erro ao aceitar entrega." });
  }
};

const completeDelivery = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, courier: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: "Entrega não encontrada." });

    if (order.status !== "delivering") {
      return res.status(400).json({ success: false, message: "Esta entrega não está em curso." });
    }

    order.status = "delivered";
    await order.save();

    const orderPopulated = await orderService.getOrderById(order._id);
    await sendOrderStatusEmail(orderPopulated);

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Erro ao completar entrega:", error.message);
    res.status(500).json({ success: false, message: "Erro ao completar entrega." });
  }
};

module.exports = {
  createSaleOrder,
  createOrder,
  getMyOrders,
  getOrderById,
  getOrdersByCustomer,
  getOrdersBySupermarket,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  acceptDelivery,
  completeDelivery,
};
