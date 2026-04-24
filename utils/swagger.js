const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Marketplace API",
      version: "1.0.0",
      description:
        "API REST do Marketplace PAW — Group 13. Autenticação via cookie `token` (JWT). Faz login em `/auth/login` para obter o cookie antes de testar os endpoints protegidos.",
    },
    servers: [{ url: "/api", description: "API principal" }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT armazenado em cookie HttpOnly. Faz login em /auth/login para obtê-lo.",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id:   { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
            name:  { type: "string", example: "João Silva" },
            email: { type: "string", example: "joao@email.com" },
            phone: { type: "string", example: "912345678" },
            role:  { type: "string", enum: ["admin", "supermarket", "courier", "customer"] },
            address: { type: "string", example: "Rua das Flores 10, Porto" },
          },
        },
        CreateUserBody: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name:     { type: "string", example: "João Silva" },
            email:    { type: "string", example: "joao@email.com" },
            password: { type: "string", example: "pass123" },
            phone:    { type: "string", example: "912345678" },
          },
        },
        // ── Supermercado ─────────────────────────────────────────────────────
        Supermarket: {
          type: "object",
          properties: {
            _id:  { type: "string" },
            name: { type: "string", example: "Mercado Central" },
            description: { type: "string" },
            location: {
              type: "object",
              properties: {
                address: { type: "string", example: "Av. da Liberdade 200, Lisboa" },
                lat: { type: "number", example: 38.7169 },
                lng: { type: "number", example: -9.1395 },
              },
            },
            deliveryMethods: { type: "array", items: { type: "string", enum: ["pickup", "courier"] } },
            deliveryCost: { type: "number", example: 2.5 },
            status: { type: "string", enum: ["pending", "approved", "rejected"] },
          },
        },
        // ── Produto ───────────────────────────────────────────────────────────
        Product: {
          type: "object",
          properties: {
            _id:      { type: "string" },
            name:     { type: "string", example: "Leite Meio-Gordo 1L" },
            price:    { type: "number", example: 0.89 },
            stock:    { type: "integer", example: 50 },
            isActive: { type: "boolean" },
            category: { type: "object", properties: { _id: { type: "string" }, name: { type: "string" } } },
            image:    { type: "string", example: "/uploads/products/abc.jpg" },
          },
        },
        // ── Categoria ────────────────────────────────────────────────────────
        Category: {
          type: "object",
          properties: {
            _id:    { type: "string" },
            name:   { type: "string", example: "Lacticínios" },
            description: { type: "string" },
            status: { type: "boolean" },
          },
        },
        // ── Encomenda ────────────────────────────────────────────────────────
        Order: {
          type: "object",
          properties: {
            _id:    { type: "string" },
            status: { type: "string", enum: ["pending","confirmed","preparing","awaiting_courier","delivering","delivered","cancelled"] },
            deliveryMethod:  { type: "string", enum: ["pickup", "courier"] },
            deliveryCost:    { type: "number" },
            deliveryAddress: { type: "string", nullable: true },
            discount:        { type: "number" },
            total:           { type: "number", example: 12.5 },
            customer:   { type: "object", properties: { name: { type: "string" }, email: { type: "string" } } },
            supermarket:{ type: "object", properties: { name: { type: "string" } } },
            courier:    { type: "object", properties: { name: { type: "string" } }, nullable: true },
            coupon:     { type: "object", properties: { code: { type: "string" }, discountValue: { type: "number" } }, nullable: true },
            products:   { type: "array", items: { type: "object", properties: { product: { type: "object" }, quantity: { type: "integer" }, unitPrice: { type: "number" } } } },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        // ── Cupão ────────────────────────────────────────────────────────────
        Coupon: {
          type: "object",
          properties: {
            _id:           { type: "string" },
            code:          { type: "string", example: "DESCONTO10" },
            discountType:  { type: "string", enum: ["percentage"] },
            discountValue: { type: "number", example: 10 },
            expiresAt:     { type: "string", format: "date-time", nullable: true },
            maxUses:       { type: "integer", example: 100 },
            usedCount:     { type: "integer", example: 5 },
            active:        { type: "boolean" },
            supermarket:   { type: "object", properties: { _id: { type: "string" }, name: { type: "string" } } },
          },
        },
        // ── Respostas genéricas ───────────────────────────────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data:    { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Mensagem de erro." },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
    tags: [
      { name: "Admins",        description: "Gestão de utilizadores admin" },
      { name: "Estafetas",     description: "Gestão de estafetas" },
      { name: "Supermercados", description: "Gestão e aprovação de supermercados" },
      { name: "Clientes",      description: "Gestão de clientes" },
      { name: "Categorias",    description: "Gestão de categorias de produtos" },
      { name: "Produtos",      description: "Gestão de produtos" },
      { name: "Encomendas",    description: "Encomendas e entregas" },
      { name: "Cupões",        description: "Cupões de desconto" },
      { name: "Auth",          description: "Autenticação (login/logout/registo)" },
    ],
  },
  apis: ["./routes/api.js"],
};

module.exports = swaggerJsdoc(options);
