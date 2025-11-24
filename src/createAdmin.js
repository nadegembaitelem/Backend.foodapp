// createAdmin.js
const bcrypt = require("bcrypt");
const sequelize = require("./src/db");
const { User } = require("./src/models");

async function createAdmin() {
  try {
    await sequelize.sync();

    const adminEmail = "admin@example.com";
    const adminPassword = "MotDePasseAdmin123";

    const exists = await User.findOne({ where: { email: adminEmail } });

    if (exists) {
      console.log("⚠️ Un admin existe déjà !");
      return process.exit(0);
    }

    const hashed = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
    });

    console.log("✅ Admin créé avec succès !");
    console.log("Email :", adminEmail);
    console.log("Mot de passe :", adminPassword);
    process.exit(0);

  } catch (err) {
    console.error("❌ Erreur création admin:", err);
    process.exit(1);
  }
}

createAdmin();
