// models/Order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db"); // ton instance sequelize existante

const Order = sequelize.define(
  "Order",
  {
    menuId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER, // doit être INT pour référencer User.id
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    customerPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    orderTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "en_attente", // même valeur que côté front/backend
    },
  },
  {
    tableName: "Orders",
    timestamps: true,
  }
);

module.exports = Order;
