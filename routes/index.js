var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//pagina de login
router.get('/auth/login', (req, res) => {
  res.render('auth/login', { erro: null });
});

//pagina de registo
router.get('/auth/registo', function(req, res, next) {
  res.render('auth/registo'); 
});

module.exports = router;
