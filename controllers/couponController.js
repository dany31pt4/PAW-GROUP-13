const Coupon = require("../models/coupon");

const createCoupon = async (req, res) => {
  try {
    const { code, discountValue, expiresAt, maxUses } = req.body;
    if (!code || !discountValue) {
      return res
        .status(400)
        .json({ success: false, message: "Código e valor são obrigatórios." });
    }
    if (parseFloat(discountValue) <= 0 || parseFloat(discountValue) > 100) {
      return res
        .status(400)
        .json({ success: false, message: "O desconto deve ser entre 1% e 100%." });
    }
    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType: "percentage",
      discountValue: parseFloat(discountValue),
      expiresAt: expiresAt || null,
      maxUses: parseInt(maxUses) || 0,
      supermarket: req.user.supermarket_id,
    });
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Já existe um cupão com este código.",
      });
    }
    console.error("Erro ao criar cupão:", error);
    res.status(500).json({ success: false, message: "Erro interno." });
  }
};

const listCoupons = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "supermarket") {
      filter = { supermarket: req.user.supermarket_id };
    }
    const coupons = await Coupon.find(filter)
      .populate("supermarket", "name")
      .sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro interno." });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    let filter = { _id: req.params.id };
    if (req.user.role === "supermarket") {
      filter.supermarket = req.user.supermarket_id;
    }
    const deleted = await Coupon.findOneAndDelete(filter);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Cupão não encontrado." });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro interno." });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.query;
    if (!code)
      return res
        .status(400)
        .json({ valid: false, message: "Código em falta." });

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      active: true,
      supermarket: req.user.supermarket_id,
    });
    if (!coupon)
      return res.json({
        valid: false,
        message: "Cupão não encontrado ou inativo.",
      });
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      return res.json({ valid: false, message: "Cupão expirado." });
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
      return res.json({ valid: false, message: "Cupão esgotado." });

    const sub = parseFloat(subtotal) || 0;
    const discount = parseFloat((sub * coupon.discountValue / 100).toFixed(2));

    res.json({
      valid: true,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    console.error("Erro ao validar cupão:", error);
    res.status(500).json({ valid: false, message: "Erro interno." });
  }
};

const getCoupon = async (req, res) => {
  try {
    let filter = { _id: req.params.id };
    if (req.user.role === "supermarket") filter.supermarket = req.user.supermarket_id;
    const coupon = await Coupon.findOne(filter).populate("supermarket", "name");
    if (!coupon) return res.status(404).json({ success: false, message: "Cupão não encontrado." });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro interno." });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { code, discountValue, expiresAt, maxUses } = req.body;
    if (discountValue !== undefined && (parseFloat(discountValue) <= 0 || parseFloat(discountValue) > 100)) {
      return res.status(400).json({ success: false, message: "O desconto deve ser entre 1% e 100%." });
    }
    let filter = { _id: req.params.id };
    if (req.user.role === "supermarket") filter.supermarket = req.user.supermarket_id;

    const updates = {};
    if (code !== undefined) updates.code = code.toUpperCase().trim();
    if (discountValue !== undefined) updates.discountValue = parseFloat(discountValue);
    if (expiresAt !== undefined) updates.expiresAt = expiresAt || null;
    if (maxUses !== undefined) updates.maxUses = parseInt(maxUses) || 0;

    const updated = await Coupon.findOneAndUpdate(filter, updates, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Cupão não encontrado." });
    res.json({ success: true, coupon: updated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Já existe um cupão com este código." });
    }
    res.status(500).json({ success: false, message: "Erro interno." });
  }
};

const toggleCoupon = async (req, res) => {
  try {
    let filter = { _id: req.params.id };
    if (req.user.role === "supermarket") filter.supermarket = req.user.supermarket_id;

    const coupon = await Coupon.findOne(filter);
    if (!coupon) return res.status(404).json({ success: false, message: "Cupão não encontrado." });

    coupon.active = !coupon.active;
    await coupon.save();
    res.json({ success: true, active: coupon.active });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro interno." });
  }
};

const validateCouponCustomer = async (req, res) => {
  try {
    const { code, supermarketId, subtotal } = req.query;
    if (!code || !supermarketId) {
      return res.status(400).json({ valid: false, message: "Código e supermercado são obrigatórios." });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      active: true,
      supermarket: supermarketId,
    });
    if (!coupon) return res.json({ valid: false, message: "Cupão não encontrado ou inativo." });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.json({ valid: false, message: "Cupão expirado." });
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return res.json({ valid: false, message: "Cupão esgotado." });

    const sub = parseFloat(subtotal) || 0;
    const discount = parseFloat((sub * coupon.discountValue / 100).toFixed(2));

    res.json({ valid: true, discount, discountType: coupon.discountType, discountValue: coupon.discountValue });
  } catch (error) {
    res.status(500).json({ valid: false, message: "Erro interno." });
  }
};

module.exports = { createCoupon, listCoupons, getCoupon, deleteCoupon, validateCoupon, validateCouponCustomer, updateCoupon, toggleCoupon };
