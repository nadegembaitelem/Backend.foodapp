// models/index.js
const sequelize = require("../../db");

const User = require("./user");
const Restaurant = require("./restaurant");
const Menu = require("./menu");
const Order = require("./Order");

// Associations

// Restaurant <-> Menu
Restaurant.hasMany(Menu, { foreignKey: "restaurantId", as: "menus" });
Menu.belongsTo(Restaurant, { foreignKey: "restaurantId", as: "restaurant" });

// Menu <-> Order
Menu.hasMany(Order, { foreignKey: "menuId", as: "orders" });
Order.belongsTo(Menu, { foreignKey: "menuId", as: "menu" });

// User <-> Order
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

sequelize.sync();

module.exports = {
  sequelize,
  User,
  Restaurant,
  Menu,
  Order,
};
