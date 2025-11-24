const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../db");


const User = sequelize.define("User", {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: {
    type: DataTypes.ENUM("admin", "proprietaire", "client"),
    allowNull: false,
    defaultValue: "client", // par défaut tout nouvel utilisateur est client
  },
});

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

module.exports = User;
