const { DataTypes } = require('sequelize');

const db = require('../database/database');

// Cart model
const Cart = db.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  price: {
    type: DataTypes.FLOAT,
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
});

module.exports = Cart;
