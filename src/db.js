const config = require("./config");
const { Sequelize } = require("sequelize");

let sequelize;

// Supporter une URL de connexion complète via DATABASE_URL (utile pour certains providers)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mariadb",
    logging: false,
  });
} else {
  const options = {
    host: config.db.host,
    dialect: "mariadb",
    logging: false,
  };
  if (config.db.port) options.port = config.db.port;

  sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    options
  );
}

sequelize
  .authenticate()
  .then(() => console.log("✅ Connecté à la base de données MariaDB"))
  .catch((err) => {
    // Loguer l'erreur complète (message + stack) pour faciliter le debug en prod
    console.error("❌ Erreur de connexion:", err);
    if (err && err.stack) console.error(err.stack);
    console.log("💡 Vérifiez vos paramètres de connexion dans le fichier .env (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME) ou la variable DATABASE_URL");
    try {
      console.log(`💡 DB host: ${config.db.host}, DB port: ${config.db.port || "(default)"}, DB name: ${config.db.database}`);
    } catch (e) {}
  });

module.exports = sequelize;
