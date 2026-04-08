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
        paginaAtiva: 'dashboard', 

        // 2. Informações do Administrador
        nomeAdmin: "Francisco Bernardo",

        // 3. Números para os Cards de Estatísticas
        totalEncomendas: 42,
        totalSupermercados: 12,
        totalPendentes: 3,
        totalDenuncias: 1,

        // 4. Lista para a Tabela (Array de Objetos)
        supermercadosPendentes: [
            { 
                _id: '1', 
                nome: 'Supermercado Modelo Bragança', 
                email: 'contacto@modelo.pt', 
                localidade: 'Bragança' 
            },
            { 
                _id: '2', 
                nome: 'Talho do Zé', 
                email: 'ze@talho.pt', 
                localidade: 'Mirandela' 
            }
        ]
    });
});

router.get('/admin/aprovacoes', function(req, res) {
    res.render('admin/aprovacoes', {
        // 1. Essencial para a sidebar saber onde está e acender a cor azul
        paginaAtiva: 'aprovacoes', 

        // 2. Essencial para mostrar a bolinha vermelha com o número no menu
        totalPendentes: 3, 

        // 3. Outros dados que a página pede
        nomeAdmin: "Francisco Bernardo",
        listaPendentes: [
            { nome: 'Mini Preço Central', tipo: 'Supermercado', email: 'loja@minipreco.pt', localidade: 'Maia' },
            { nome: 'João Entregas', tipo: 'Estafeta', email: 'joao@email.com', localidade: 'Porto' },
            { nome: 'Frutaria da Maria', tipo: 'Supermercado', email: 'maria@frutas.pt', localidade: 'Gaia' }
        ]
    });
});


router.get('/admin/encomendas', function(req, res) {
    res.render('admin/encomendas', {
        paginaAtiva: 'encomendas',
        nomeAdmin: "Francisco Bernardo",
        totalPendentes: 3,
        listaEncomendas: [
            { id: '1024', cliente: 'Maria Silva', loja: 'Pingo Doce', valor: '45.20', estado: 'Entregue' },
            { id: '1025', cliente: 'José Santos', loja: 'Continente', valor: '12.80', estado: 'Pendente' },
            { id: '1026', cliente: 'Carla Dias', loja: 'Lidl', valor: '89.00', estado: 'Entregue' }
        ]
    });
});


router.get('/admin/utilizadores', function(req, res) {
    res.render('admin/utilizadores', {
        paginaAtiva: 'utilizadores',
        nomeAdmin: "Francisco Bernardo",
        totalPendentes: 3,
        // Dados fictícios para as 3 tabelas
        clientes: [
            { nome: "Ana Martins", email: "ana@email.com", data: "01/04/2026" },
            { nome: "Carlos Costa", email: "carlos@email.com", data: "03/04/2026" }
        ],
        lojas: [
            { nome: "Continente Bom Dia", localidade: "Paredes" },
            { nome: "Pingo Doce", localidade: "Penafiel" }
        ],
        estafetas: [
            { nome: "Paulo Motard", veiculo: "Mota", totalEntregas: 142 },
            { nome: "Sérgio Bike", veiculo: "Bicicleta", totalEntregas: 89 }
        ]
    });
});

module.exports = router;
