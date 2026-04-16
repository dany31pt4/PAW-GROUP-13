var multer = require('multer');
var path = require('path');
var crypto = require('crypto');

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/products/');
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = crypto.randomBytes(16).toString('hex');
    cb(null, unique + ext);
  }
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function(req, file, cb) {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Apenas imagens são permitidas (jpeg, jpg, png, webp)."));
  }
});

module.exports = upload;
