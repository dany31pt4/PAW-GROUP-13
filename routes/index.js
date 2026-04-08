var express = require("express");
var router = express.Router();
var { verifyToken } = require("../middlewares/authMiddleware");
/* GET home page. */
router.get("/", verifyToken, function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/index", verifyToken, function (req, res, next) {
  res.render("index", { title: "Express" });
});


router.get('/admin/dashboard', function(req, res) {
    // Dados de teste (Mock Data) para a página não abrir vazia
    res.render('admin/dashboard', {
        // 1. Controle de Navegação (A nova melhoria)
        activePage: 'dashboard', 

        // 2. Informações do Administrador
        adminName: "Francisco Bernardo",

        // 3. Números para os Cards de Estatísticas
        totalOrders: 42,
        totalMarkets: 12,
        allPending: 3,
        totalComplaints: 1,

        // 4. Lista para a Tabela (Array de Objetos)
        pendingMarkets: [
            { 
                _id: '1', 
                name: 'Supermercado Modelo Bragança', 
                email: 'contacto@modelo.pt', 
                location: 'Bragança' 
            },
            { 
                _id: '2', 
                name: 'Talho do Zé', 
                email: 'ze@talho.pt', 
                location: 'Mirandela' 
            }
        ]
    });
});

router.get('/admin/approvals', function(req, res) {
    res.render('admin/approvals', {
        // 1. Essencial para a sidebar saber onde está e acender a cor azul
        activePage: 'approvals', 

        // 2. Essencial para mostrar a bolinha vermelha com o número no menu
        allPending: 3, 

        // 3. Outros dados que a página pede
        adminName: "Francisco Bernardo",
        pendingList: [
            { name: 'Mini Preço Central', type: 'Supermercado', email: 'loja@minipreco.pt', location: 'Maia' },
            { name: 'João Entregas', type: 'Estafeta', email: 'joao@email.com', location: 'Porto' },
            { name: 'Frutaria da Maria', type: 'Supermercado', email: 'maria@frutas.pt', location: 'Gaia' }
        ]
    });
});


router.get('/admin/orders', function(req, res) {
    res.render('admin/orders', {
        activePage: 'orders',
        adminName: "Francisco Bernardo",
        allPending: 3,
        listaEncomendas: [
            { id: '1024', client: 'Maria Silva', market: 'Pingo Doce', value: '45.20', state: 'Entregue' },
            { id: '1025', client: 'José Santos', market: 'Continente', value: '12.80', state: 'Pendente' },
            { id: '1026', client: 'Carla Dias', market: 'Lidl', value: '89.00', state: 'Entregue' }
        ]
    });
});


router.get('/admin/users', function(req, res) {
    res.render('admin/users', {
        activePage: 'users',
        adminName: "Francisco Bernardo",
        allPending: 3,
        // Dados fictícios para as 3 tabelas
        clients: [
            { name: "Ana Martins", email: "ana@email.com", data: "01/04/2026" },
            { name: "Carlos Costa", email: "carlos@email.com", data: "03/04/2026" }
        ],
        markets: [
            { name: "Continente Bom Dia", location: "Paredes" },
            { name: "Pingo Doce", location: "Penafiel" }
        ],
        couriers: [
            { name: "Paulo Motard", vehicle: "Mota", totalDeliveries: 142 },
            { name: "Sérgio Bike", vehicle: "Bicicleta", totalDeliveries: 89 }
        ]
    });
});

module.exports = router;
