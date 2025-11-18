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
    // Loguer l'erreur complète (message + stack) pour faciliter le debug en prod
    console.error("❌ Erreur de connexion:", err);
    if (err && err.stack) console.error(err.stack);
    console.log("💡 Vérifiez vos paramètres de connexion dans le fichier .env (DB_HOST, DB_USER, DB_PASS, DB_NAME)");
    console.log(`💡 DB host: ${config.db.host}, DB name: ${config.db.database}`);
  });
module.exports = sequelize;
