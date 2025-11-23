const { DataTypes } = require("sequelize");
const sequelize = require("../../db");


module.exports = sequelize.define(
  "Restaurant",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    cuisine: { type: DataTypes.STRING },
    price: { type: DataTypes.FLOAT },
    latitude: { type: DataTypes.FLOAT },
    longitude: { type: DataTypes.FLOAT },
  },
  { tableName: "Restaurants", timestamps: true }
);
