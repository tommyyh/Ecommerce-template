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
    allowNull: true,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  }
});

module.exports = Cart;
