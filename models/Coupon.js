const { DataTypes } = require('sequelize');

const db = require('../database/database');

// Coupon model
const Coupon = db.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Coupon;
