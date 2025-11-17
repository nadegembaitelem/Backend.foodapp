const config = require("./config");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    dialect: "mariadb",
  }
);
sequelize
  .authenticate()
  .then(() => console.log("✅ Connecté à la base de données MariaDB"))
  .catch((err) => {
    console.error("❌ Erreur de connexion:", err.message);
    console.log("💡 Vérifiez vos paramètres de connexion dans le fichier .env");
  });
module.exports = sequelize;
