require("dotenv").config();

module.exports = {
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "foodapp",
  },
  jwtSecret: process.env.JWT_SECRET || "supersecret",
  port: process.env.PORT || 4000,
};
