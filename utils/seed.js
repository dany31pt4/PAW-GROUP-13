const bcrypt = require("bcrypt");
const User = require("../models/user");
const password = process.env.SUPER_ADMIN_PASSWORD;
const SALT_ROUNDS = 10;
const seedSuperAdmin = async () => {
  try {
    const exists = await User.findOne({ isSuperAdmin: true });
    if (exists) return;

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await User.create({
      name: "superadmin",
      email: "superadmin@gmail.com",
      password: hashed,
      role: "admin",
      isSuperAdmin: true,
    });

    console.log("Superadmin criado.");
  } catch (err) {
    console.error("Erro ao criar superadmin:", err.message);
  }
};

module.exports = { seedSuperAdmin };
