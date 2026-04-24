var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const marketController = require("../controllers/supermarketController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");
const couponController = require("../controllers/couponController");
var { verifyToken, verifyRole, verifySupermarketStatus } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

/*
=====
ADMIN ROUTES
=====
*/

/**
 * @openapi
 * /users/createAdmin:
 *   post:
 *     tags: [Admins]
 *     summary: Criar novo admin
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserBody' }
 *     responses:
 *       201: { description: Admin criado }
 *       400: { description: Dados inválidos }
 */
router.post("/users/createAdmin", verifyToken, verifyRole(["admin"]), userController.createAdmin);

/**
 * @openapi
 * /users/deleteAdmin/{id}:
 *   delete:
 *     tags: [Admins]
 *     summary: Eliminar admin
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Admin eliminado }
 *       404: { description: Não encontrado }
 */
router.delete("/users/deleteAdmin/:id", verifyToken, verifyRole(["admin"]), userController.deleteAdmin);

/**
 * @openapi
 * /users/listAdmins:
 *   get:
 *     tags: [Admins]
 *     summary: Listar todos os admins
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get("/users/listAdmins", verifyToken, verifyRole(["admin"]), userController.listAdmins);

/**
 * @openapi
 * /users/admin/{id}:
 *   get:
 *     tags: [Admins]
 *     summary: Obter admin por ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Admin encontrado }
 *       404: { description: Não encontrado }
 */
router.get("/users/admin/:id", verifyToken, verifyRole(["admin"]), userController.getAdminById);

/**
 * @openapi
 * /users/updateAdmin/{id}:
 *   put:
 *     tags: [Admins]
 *     summary: Atualizar admin
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserBody' }
 *     responses:
 *       200: { description: Admin atualizado }
 */
router.put("/users/updateAdmin/:id", verifyToken, verifyRole(["admin"]), userController.updateAdmin);

/*
=====
COURIER ROUTES
=====
*/

/**
 * @openapi
 * /users/listCouriers:
 *   get:
 *     tags: [Estafetas]
 *     summary: Listar todos os estafetas
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de estafetas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get("/users/listCouriers", verifyToken, verifyRole(["admin"]), userController.listCouriers);

/**
 * @openapi
 * /users/createCourier:
 *   post:
 *     tags: [Estafetas]
 *     summary: Criar novo estafeta
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserBody' }
 *     responses:
 *       201: { description: Estafeta criado }
 *       400: { description: Dados inválidos }
 */
router.post("/users/createCourier", verifyToken, verifyRole(["admin"]), userController.createCourier);

/**
 * @openapi
 * /users/courier/{id}:
 *   get:
 *     tags: [Estafetas]
 *     summary: Obter estafeta por ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Estafeta encontrado }
 *       404: { description: Não encontrado }
 */
router.get("/users/courier/:id", verifyToken, verifyRole(["admin"]), userController.getCourierById);

/**
 * @openapi
 * /users/updateCourier/{id}:
 *   put:
 *     tags: [Estafetas]
 *     summary: Atualizar estafeta
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserBody' }
 *     responses:
 *       200: { description: Estafeta atualizado }
 */
router.put("/users/updateCourier/:id", verifyToken, verifyRole(["admin"]), userController.updateCourier);

/**
 * @openapi
 * /users/deleteCourier/{id}:
 *   delete:
 *     tags: [Estafetas]
 *     summary: Eliminar estafeta
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Estafeta eliminado }
 *       404: { description: Não encontrado }
 */
router.delete("/users/deleteCourier/:id", verifyToken, verifyRole(["admin"]), userController.deleteCourier);

/*
=====
SUPERMARKET ROUTES
=====
*/

/**
 * @openapi
 * /supermarkets/create:
 *   post:
 *     tags: [Supermercados]
 *     summary: Registar novo supermercado (admin)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, userId]
 *             properties:
 *               name:    { type: string, example: "Mercado Central" }
 *               address: { type: string, example: "Av. da Liberdade 200, Lisboa" }
 *               userId:  { type: string }
 *     responses:
 *       201: { description: Supermercado criado }
 *       400: { description: Dados inválidos }
 */
router.post("/supermarkets/create", verifyToken, verifyRole(["admin"]), marketController.registerSupermarket);

/**
 * @openapi
 * /supermarkets/map:
 *   get:
 *     tags: [Supermercados]
 *     summary: Listar supermercados aprovados com coordenadas (público)
 *     responses:
 *       200:
 *         description: Lista de supermercados para o mapa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:      { type: string }
 *                   name:     { type: string }
 *                   location: { type: object, properties: { address: { type: string }, lat: { type: number }, lng: { type: number } } }
 */
router.get("/supermarkets/map", marketController.getMapSupermarkets);

/**
 * @openapi
 * /supermarkets/approved:
 *   get:
 *     tags: [Supermercados]
 *     summary: Listar supermercados aprovados (cliente)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de supermercados ativos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Supermarket' }
 */
router.get("/supermarkets/approved", verifyToken, verifyRole(["customer"]), marketController.listApprovedSupermarkets);

/**
 * @openapi
 * /supermarkets/list:
 *   get:
 *     tags: [Supermercados]
 *     summary: Listar todos os supermercados
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de supermercados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Supermarket' }
 */
router.get("/supermarkets/list", verifyToken, verifyRole(["admin"]), marketController.listSupermarkets);

/**
 * @openapi
 * /supermarkets/listPending:
 *   get:
 *     tags: [Supermercados]
 *     summary: Listar supermercados pendentes de aprovação
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Lista de supermercados pendentes }
 */
router.get("/supermarkets/listPending", verifyToken, verifyRole(["admin"]), marketController.listPendingSupermarkets);

/**
 * @openapi
 * /supermarkets/approve/{id}:
 *   put:
 *     tags: [Supermercados]
 *     summary: Aprovar supermercado
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Supermercado aprovado }
 *       404: { description: Não encontrado }
 */
router.put("/supermarkets/approve/:id", verifyToken, verifyRole(["admin"]), marketController.approveSupermarket);

/**
 * @openapi
 * /supermarkets/reject/{id}:
 *   put:
 *     tags: [Supermercados]
 *     summary: Rejeitar supermercado
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Supermercado rejeitado }
 *       404: { description: Não encontrado }
 */
router.put("/supermarkets/reject/:id", verifyToken, verifyRole(["admin"]), marketController.rejectSupermarket);

/**
 * @openapi
 * /supermarkets/update/{id}:
 *   put:
 *     tags: [Supermercados]
 *     summary: Atualizar supermercado (admin)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:            { type: string }
 *               address:         { type: string }
 *               deliveryCost:    { type: number }
 *               deliveryMethods: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Supermercado atualizado }
 */
router.put("/supermarkets/update/:id", verifyToken, verifyRole(["admin"]), marketController.updateSupermarket);

/**
 * @openapi
 * /supermarkets/me:
 *   put:
 *     tags: [Supermercados]
 *     summary: Atualizar dados do próprio supermercado
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:            { type: string }
 *               address:         { type: string }
 *               deliveryCost:    { type: number }
 *               deliveryMethods: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Dados atualizados }
 */
router.put("/supermarkets/me", verifyToken, verifyRole(["supermarket"]), marketController.updateMySupermarket);

/**
 * @openapi
 * /supermarkets/delete/{id}:
 *   delete:
 *     tags: [Supermercados]
 *     summary: Eliminar supermercado
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Supermercado eliminado }
 *       404: { description: Não encontrado }
 */
router.delete("/supermarkets/delete/:id", verifyToken, verifyRole(["admin"]), marketController.deleteSupermarket);

/**
 * @openapi
 * /supermarkets/{id}:
 *   get:
 *     tags: [Supermercados]
 *     summary: Obter detalhes de supermercado por ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalhes do supermercado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Supermarket' }
 *       404: { description: Não encontrado }
 */
router.get("/supermarkets/:id", verifyToken, verifyRole(["admin"]), marketController.getSupermarketDetails);

/*
=====
CUSTOMER ROUTES
=====
*/

/**
 * @openapi
 * /customers/list:
 *   get:
 *     tags: [Clientes]
 *     summary: Listar todos os clientes
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get("/customers/list", verifyToken, verifyRole(["admin"]), userController.listCustomers);

/**
 * @openapi
 * /customers/create:
 *   post:
 *     tags: [Clientes]
 *     summary: Criar novo cliente (admin ou supermercado)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserBody' }
 *     responses:
 *       201: { description: Cliente criado }
 *       400: { description: Email já em uso }
 */
router.post("/customers/create", verifyToken, verifyRole(["admin", "supermarket"]), userController.createCustomer);

/**
 * @openapi
 * /customers/email/{email}:
 *   get:
 *     tags: [Clientes]
 *     summary: Obter cliente por email
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string }
 *         example: cliente@email.com
 *     responses:
 *       200: { description: Cliente encontrado }
 *       404: { description: Não encontrado }
 */
router.get("/customers/email/:email", verifyToken, verifyRole(["admin", "supermarket"]), userController.getCustomerByEmail);

/**
 * @openapi
 * /customers/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Obter cliente por ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cliente encontrado }
 *       404: { description: Não encontrado }
 */
router.get("/customers/:id", verifyToken, verifyRole(["admin"]), userController.getCustomerById);

/**
 * @openapi
 * /customers/update/{id}:
 *   put:
 *     tags: [Clientes]
 *     summary: Atualizar cliente
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserBody' }
 *     responses:
 *       200: { description: Cliente atualizado }
 */
router.put("/customers/update/:id", verifyToken, verifyRole(["admin"]), userController.updateCustomer);

/**
 * @openapi
 * /customers/delete/{id}:
 *   delete:
 *     tags: [Clientes]
 *     summary: Eliminar cliente
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cliente eliminado }
 *       404: { description: Não encontrado }
 */
router.delete("/customers/delete/:id", verifyToken, verifyRole(["admin"]), userController.deleteCustomer);

/*
=====
CATEGORY ROUTES
=====
*/

/**
 * @openapi
 * /categories/create:
 *   post:
 *     tags: [Categorias]
 *     summary: Criar nova categoria
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:        { type: string, example: "Lacticínios" }
 *               description: { type: string }
 *     responses:
 *       201: { description: Categoria criada }
 *       400: { description: Nome em falta }
 */
router.post("/categories/create", verifyToken, verifyRole(["admin"]), categoryController.createCategory);

/**
 * @openapi
 * /categories/list:
 *   get:
 *     tags: [Categorias]
 *     summary: Listar todas as categorias
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Category' }
 */
router.get("/categories/list", verifyToken, verifyRole(["admin", "supermarket"]), categoryController.listCategories);

/**
 * @openapi
 * /categories/update/{id}:
 *   put:
 *     tags: [Categorias]
 *     summary: Atualizar categoria
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:        { type: string }
 *               description: { type: string }
 *     responses:
 *       200: { description: Categoria atualizada }
 */
router.put("/categories/update/:id", verifyToken, verifyRole(["admin"]), categoryController.updateCategory);

/**
 * @openapi
 * /categories/delete/{id}:
 *   delete:
 *     tags: [Categorias]
 *     summary: Eliminar categoria
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Categoria eliminada }
 */
router.delete("/categories/delete/:id", verifyToken, verifyRole(["admin"]), categoryController.deleteCategory);

router.put("/categories/toggle/:id", verifyToken, verifyRole(["admin"]), categoryController.toggleCategory);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categorias]
 *     summary: Obter categoria por ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Categoria encontrada }
 *       404: { description: Não encontrada }
 */
router.get("/categories/:id", verifyToken, verifyRole(["admin"]), categoryController.getCategoryById);

/*
=====
PRODUCT ROUTES
=====
*/

/**
 * @openapi
 * /product/create:
 *   post:
 *     tags: [Produtos]
 *     summary: Criar produto (multipart/form-data com imagem opcional)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, price, stock]
 *             properties:
 *               name:       { type: string, example: "Leite Meio-Gordo 1L" }
 *               price:      { type: number, example: 0.89 }
 *               stock:      { type: integer, example: 50 }
 *               categoryId: { type: string }
 *               description:{ type: string }
 *               image:      { type: string, format: binary }
 *     responses:
 *       201: { description: Produto criado }
 *       400: { description: Dados inválidos }
 */
router.post("/product/create", verifyToken, verifyRole(["admin","supermarket"]), verifySupermarketStatus, upload.single("image"), productController.createProduct);

/**
 * @openapi
 * /product/list/me:
 *   get:
 *     tags: [Produtos]
 *     summary: Listar produtos do próprio supermercado
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Product' }
 */
router.get("/product/list/me", verifyToken, verifyRole(["supermarket"]), productController.listMyProducts);

/**
 * @openapi
 * /product/list/{id}:
 *   get:
 *     tags: [Produtos]
 *     summary: Listar produtos de um supermercado por ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID do supermercado
 *     responses:
 *       200: { description: Lista de produtos }
 */
router.get("/product/list/:id", verifyToken, verifyRole(["admin","supermarket","customer"]), productController.listProduct);

/**
 * @openapi
 * /product/{id}:
 *   get:
 *     tags: [Produtos]
 *     summary: Obter produto por ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404: { description: Não encontrado }
 */
router.get("/product/:id", verifyToken, verifyRole(["admin","supermarket"]), productController.getProductById);

/**
 * @openapi
 * /product/update/{id}:
 *   put:
 *     tags: [Produtos]
 *     summary: Atualizar produto (multipart/form-data)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:       { type: string }
 *               price:      { type: number }
 *               stock:      { type: integer }
 *               categoryId: { type: string }
 *               image:      { type: string, format: binary }
 *     responses:
 *       200: { description: Produto atualizado }
 */
router.put("/product/update/:id", verifyToken, verifyRole(["admin","supermarket"]), verifySupermarketStatus, upload.single("image"), productController.updateProduct);

/**
 * @openapi
 * /product/delete/{id}:
 *   delete:
 *     tags: [Produtos]
 *     summary: Eliminar produto
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Produto eliminado }
 *       404: { description: Não encontrado }
 */
router.delete("/product/delete/:id", verifyToken, verifyRole(["admin","supermarket"]), verifySupermarketStatus, productController.deleteProduct);

/**
 * @openapi
 * /product/toggle/{id}:
 *   put:
 *     tags: [Produtos]
 *     summary: Ativar/desativar produto
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Estado do produto alterado }
 */
router.put("/product/toggle/:id", verifyToken, verifyRole(["admin","supermarket"]), verifySupermarketStatus, productController.toggleProduct);

/*
=====
ORDER ROUTES
=====
*/

/**
 * @openapi
 * /orders/courier/accept/{id}:
 *   put:
 *     tags: [Encomendas]
 *     summary: Estafeta aceita entrega (muda estado para "delivering")
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Entrega aceite }
 *       400: { description: Entrega não disponível ou já tem estafeta }
 */
router.put("/orders/courier/accept/:id", verifyToken, verifyRole(["courier"]), orderController.acceptDelivery);

/**
 * @openapi
 * /orders/courier/complete/{id}:
 *   put:
 *     tags: [Encomendas]
 *     summary: Estafeta marca entrega como concluída (muda estado para "delivered")
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Entrega concluída }
 *       400: { description: Entrega não está em curso }
 */
router.put("/orders/courier/complete/:id", verifyToken, verifyRole(["courier"]), orderController.completeDelivery);

/**
 * @openapi
 * /orders/sale:
 *   post:
 *     tags: [Encomendas]
 *     summary: Registar venda presencial (supermercado)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, products]
 *             properties:
 *               customerId:     { type: string }
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string }
 *                     quantity:  { type: integer }
 *               deliveryMethod: { type: string, enum: [pickup, courier], default: pickup }
 *               deliveryCost:   { type: number }
 *               deliveryAddress:{ type: string }
 *               couponCode:     { type: string }
 *     responses:
 *       201:
 *         description: Venda registada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       400: { description: Stock insuficiente ou dados inválidos }
 *       404: { description: Cliente ou produto não encontrado }
 */
router.post("/orders/sale", verifyToken, verifyRole(["supermarket"]), verifySupermarketStatus, orderController.createSaleOrder);
/**
 * @openapi
 * /orders/create:
 *   post:
 *     tags: [Encomendas]
 *     summary: Criar encomenda online (cliente)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supermarketId, products]
 *             properties:
 *               supermarketId:   { type: string }
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string }
 *                     quantity:  { type: integer, example: 2 }
 *               deliveryMethod:  { type: string, enum: [pickup, courier], default: pickup }
 *               deliveryAddress: { type: string, example: "Rua das Flores 10, Porto" }
 *               couponCode:      { type: string, example: "DESCONTO10" }
 *     responses:
 *       201: { description: Encomenda criada }
 *       400: { description: Dados inválidos ou stock insuficiente }
 *       404: { description: Supermercado ou produto não encontrado }
 */
router.post("/orders/create", verifyToken, verifyRole(["customer"]), orderController.createOrder);

/**
 * @openapi
 * /orders/my:
 *   get:
 *     tags: [Encomendas]
 *     summary: Listar as minhas encomendas (cliente autenticado)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de encomendas do cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Order' }
 */
router.get("/orders/my", verifyToken, verifyRole(["customer"]), orderController.getMyOrders);

/**
 * @openapi
 * /orders/list:
 *   get:
 *     tags: [Encomendas]
 *     summary: Listar todas as encomendas (admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de encomendas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Order' }
 */
router.get("/orders/list", verifyToken, verifyRole(["admin"]), orderController.getAllOrders);

/**
 * @openapi
 * /orders/supermarket/{id}:
 *   get:
 *     tags: [Encomendas]
 *     summary: Listar encomendas de um supermercado
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID do supermercado
 *     responses:
 *       200: { description: Lista de encomendas }
 */
router.get("/orders/supermarket/:id", verifyToken, verifyRole(["admin", "supermarket"]), orderController.getOrdersBySupermarket);

/**
 * @openapi
 * /orders/customer/{id}:
 *   get:
 *     tags: [Encomendas]
 *     summary: Listar encomendas de um cliente
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID do cliente
 *     responses:
 *       200: { description: Histórico de encomendas do cliente }
 */
router.get("/orders/customer/:id", verifyToken, verifyRole(["admin", "supermarket"]), orderController.getOrdersByCustomer);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Encomendas]
 *     summary: Obter encomenda por ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Encomenda encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       404: { description: Não encontrada }
 */
router.get("/orders/:id", verifyToken, verifyRole(["admin", "supermarket"]), orderController.getOrderById);

/**
 * @openapi
 * /orders/status/{id}:
 *   put:
 *     tags: [Encomendas]
 *     summary: Atualizar estado de encomenda
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, awaiting_courier, delivering, delivered, cancelled]
 *     responses:
 *       200: { description: Estado atualizado }
 *       400: { description: Estado inválido }
 */
router.put("/orders/status/:id", verifyToken, verifyRole(["admin", "supermarket"]), orderController.updateOrderStatus);

/**
 * @openapi
 * /orders/cancel/{id}:
 *   put:
 *     tags: [Encomendas]
 *     summary: Cancelar encomenda (até 5 min após confirmação)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Encomenda cancelada, stock reposto }
 *       400: { description: Prazo expirado ou estado inválido }
 */
router.put("/orders/cancel/:id", verifyToken, verifyRole(["admin", "supermarket", "customer"]), orderController.cancelOrder);

/*
=====
COUPON ROUTES
=====
*/

/**
 * @openapi
 * /coupons/create:
 *   post:
 *     tags: [Cupões]
 *     summary: Criar cupão (admin cria global; supermercado cria para a sua loja)
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discountType, discountValue]
 *             properties:
 *               code:          { type: string, example: "DESCONTO10" }
 *               discountType:  { type: string, enum: [percentage, fixed] }
 *               discountValue: { type: number, example: 10 }
 *               expiresAt:     { type: string, format: date, example: "2025-12-31" }
 *               maxUses:       { type: integer, example: 100, description: "0 = ilimitado" }
 *     responses:
 *       201: { description: Cupão criado }
 *       400: { description: Código já existe ou dados inválidos }
 */
router.post("/coupons/create", verifyToken, verifyRole(["supermarket"]), couponController.createCoupon);

/**
 * @openapi
 * /coupons/list:
 *   get:
 *     tags: [Cupões]
 *     summary: Listar cupões (admin vê todos; supermercado vê só os seus)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de cupões
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Coupon' }
 */
router.get("/coupons/list", verifyToken, verifyRole(["admin", "supermarket"]), couponController.listCoupons);

/**
 * @openapi
 * /coupons/delete/{id}:
 *   delete:
 *     tags: [Cupões]
 *     summary: Eliminar cupão
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cupão eliminado }
 *       404: { description: Não encontrado }
 */
/**
 * @openapi
 * /coupons/validate:
 *   get:
 *     tags: [Cupões]
 *     summary: Validar cupão e calcular desconto
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema: { type: string }
 *         example: DESCONTO10
 *       - in: query
 *         name: subtotal
 *         required: true
 *         schema: { type: number }
 *         example: 25.50
 *     responses:
 *       200:
 *         description: Resultado da validação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:         { type: boolean }
 *                 discount:      { type: number, example: 2.55 }
 *                 discountType:  { type: string }
 *                 discountValue: { type: number }
 *                 message:       { type: string, description: "Presente apenas se valid=false" }
 */
router.get("/coupons/validate", verifyToken, verifyRole(["supermarket"]), couponController.validateCoupon);
/**
 * @openapi
 * /coupons/validate-customer:
 *   get:
 *     tags: [Cupões]
 *     summary: Validar cupão (cliente)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: supermarketId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: subtotal
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Resultado da validação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:         { type: boolean }
 *                 discount:      { type: number }
 *                 discountValue: { type: number }
 *                 message:       { type: string }
 */
router.get("/coupons/validate-customer", verifyToken, verifyRole(["customer"]), couponController.validateCouponCustomer);

/**
 * @openapi
 * /coupons/{id}:
 *   get:
 *     tags: [Cupões]
 *     summary: Obter detalhes de um cupão por ID
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cupão encontrado }
 *       404: { description: Não encontrado }
 */
router.get("/coupons/:id", verifyToken, verifyRole(["admin", "supermarket"]), couponController.getCoupon);
router.delete("/coupons/delete/:id", verifyToken, verifyRole(["admin", "supermarket"]), couponController.deleteCoupon);

/**
 * @openapi
 * /coupons/update/{id}:
 *   put:
 *     tags: [Cupões]
 *     summary: Editar cupão (código, desconto, validade, usos máximos)
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:          { type: string, example: "PROMO20" }
 *               discountValue: { type: number, example: 20 }
 *               expiresAt:     { type: string, format: date, nullable: true }
 *               maxUses:       { type: integer, example: 50 }
 *     responses:
 *       200: { description: Cupão atualizado }
 *       400: { description: Código duplicado ou valor inválido }
 *       404: { description: Não encontrado }
 */
router.put("/coupons/update/:id", verifyToken, verifyRole(["admin", "supermarket"]), couponController.updateCoupon);

/**
 * @openapi
 * /coupons/toggle/{id}:
 *   put:
 *     tags: [Cupões]
 *     summary: Ativar ou desativar cupão
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Estado alterado }
 *       404: { description: Não encontrado }
 */
router.put("/coupons/toggle/:id", verifyToken, verifyRole(["admin", "supermarket"]), couponController.toggleCoupon);

module.exports = router;
