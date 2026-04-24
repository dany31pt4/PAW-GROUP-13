const bcrypt = require("bcrypt");
const User = require("../models/user");

const seedSuperAdmin = async () => {
  try {
    const exists = await User.findOne({ isSuperAdmin: true });
    if (exists) return;

    const hashed = await bcrypt.hash("estg2026", 10);
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
