const { DataTypes } = require("sequelize");
const sequelize = require("../../db");

// Modèle Menu — représente les plats/menus proposés par un restaurant
const Menu = sequelize.define(
  "Menu",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    restaurantId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    image: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "Menus",
    timestamps: true,
  }
);

module.exports = Menu;
