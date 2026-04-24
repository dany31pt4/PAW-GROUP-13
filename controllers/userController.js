const userService = require("../utils/userService");

/*
=======================================================
ADMIN CONTROLLERs
=======================================================
*/

const createAdmin = async (req, res) => {
  try {
    if (!req.body.password) {
      return res
        .status(400)
        .json({ success: false, message: "A password é obrigatória." });
    }

    const newAdmin = await userService.createUser({
      ...req.body,
      role: "admin",
    });
    res.status(201).json({ success: true, data: newAdmin });
  } catch (err) {
    console.error("Erro ao criar administrador:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const loggedInUserId = req.user.id;

    if (adminId === loggedInUserId) {
      return res.status(403).json({
        success: false,
        message: "Não podes eliminar a tua própria conta.",
      });
    }

    const target = await userService.getUserById(adminId);
    if (target && target.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Esta conta não pode ser eliminada." });
    }

    const deletedAdmin = await userService.deleteUser(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Administrador não encontrado.",
      });
    }
    return res.json({
      success: true,
      message: "Administrador removido com sucesso.",
    });
  } catch (error) {
    console.error("Erro na função deleteAdmin:", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor ao tentar remover o administrador.",
    });
  }
};

const listAdmins = async (req, res) => {
  try {
    const admins = await userService.getUsersByRole("admin");
    return res.status(200).json(admins);
  } catch (error) {
    console.error("Erro ao listar admins:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno no servidor." });
  }
};

const getAdminById = async (req, res) => {
  try {
    const admin = await userService.getUserById(req.params.id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Administrador não encontrado." });
    }
    return res.status(200).json(admin);
  } catch (error) {
    console.error("Erro ao procurar admin:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno no servidor." });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const target = await userService.getUserById(req.params.id);
    if (target && target.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Esta conta não pode ser editada." });
    }

    const updated = await userService.updateUser(req.params.id, req.body);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Administrador não encontrado." });
    }
    return res.json({
      success: true,
      message: "Administrador atualizado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao atualizar admin:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno ao guardar alterações." });
  }
};

/*
=======================================================
END OF ADMIN CONTROLLER
=======================================================
*/

/*
=======================================================
START OF COURIER CONTROLLER
=======================================================
*/
const listCouriers = async (req, res) => {
  try {
    const couriers = await userService.getUsersByRole("courier");
    res.json(couriers);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao listar estafetas." });
  }
};

const getCourierById = async (req, res) => {
  try {
    const courier = await userService.getUserById(req.params.id);
    if (!courier) {
      return res
        .status(404)
        .json({ success: false, message: "Estafeta não encontrado." });
    }
    res.json(courier);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao procurar estafeta." });
  }
};

const createCourier = async (req, res) => {
  try {
    const newCourier = await userService.createUser({
      ...req.body,
      role: "courier",
    });
    res.status(201).json({ success: true, data: newCourier });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Email já existe ou dados inválidos." });
  }
};

const updateCourier = async (req, res) => {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Estafeta não encontrado." });
    }
    res.json({ success: true, message: "Estafeta atualizado com sucesso!" });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Erro ao atualizar estafeta." });
  }
};

const deleteCourier = async (req, res) => {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Estafeta não encontrado." });
    }
    res.json({ success: true, message: "Estafeta eliminado com sucesso!" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao eliminar estafeta." });
  }
};

const registerCourier = async (req, res) => {
  try {
    await userService.createUser({ ...req.body, role: "courier" });
    res.redirect("/auth/login");
  } catch (err) {
    res.render("auth/register", { erro: "Erro ao registar." });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Nome, email e password são obrigatórios." });
    }
    const newCustomer = await userService.createUser({ name, email, phone, password, address, role: "customer" });
    res.status(201).json({ success: true, data: newCustomer });
  } catch (err) {
    if (err.message && err.message.includes("E11000")) {
      return res.status(400).json({ success: false, message: "Este email já está registado." });
    }
    res.status(500).json({ success: false, message: "Erro ao criar cliente." });
  }
};

const listCustomers = async (req, res) => {
  try {
    const customers = await userService.getUsersByRole("customer");
    res.json(customers);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao listar clientes." });
  }
};

const getCustomerByEmail = async (req, res) => {
  try {
    const customer = await userService.getUserByEmail(req.params.email, "customer");
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Cliente não encontrado." });
    }
    res.json(customer);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao procurar cliente." });
  }
};
const getCustomerById = async (req, res) => {
  try {
    const customer = await userService.getUserById(req.params.id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Cliente não encontrado." });
    }
    res.json(customer);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao procurar cliente." });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Cliente não encontrado." });
    }
    res.json({ success: true, message: "Cliente atualizado com sucesso!" });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Erro ao atualizar os dados do cliente.",
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Cliente já não existe." });
    }
    res.json({ success: true, message: "Cliente eliminado com sucesso!" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao tentar eliminar." });
  }
};

module.exports = {
  createAdmin,
  deleteAdmin,
  listAdmins,
  getAdminById,
  updateAdmin,
  listCouriers,
  createCourier,
  getCourierById,
  updateCourier,
  deleteCourier,
  registerCourier,
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerByEmail,
};
