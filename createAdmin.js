const bcrypt = require("bcrypt");
const { User } = require("./src/models");

async function createAdmin() {
  try {
    // Vérifie si l'admin existe déjà
    const existingAdmin = await User.findOne({ where: { email: "admin@example.com" } });
    if (existingAdmin) {
      console.log("Admin déjà créé :", existingAdmin.email);
      process.exit(0);
    }

    // Crée le mot de passe hashé
    const hashedPassword = await bcrypt.hash("motdepasse123", 10);

    // Crée l'utilisateur admin
    const admin = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin créé :", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("Erreur :", err);
    process.exit(1);
  }
}

createAdmin();
