const { DataTypes, INTEGER } = require('sequelize');

const db = require('../database/database');

// Cart products model
const cartProducts = db.define('cartProducts', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  imagePath: {
    type: DataTypes.STRING,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  discount: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 0,
  },
  discountedPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    allowNull: true
  },
  available: {
    type: DataTypes.TINYINT,
    validate: {
      min: 0,
      max: 1,
    },
    defaultValue: 1,
  },
  slug: {
    type: DataTypes.STRING,
  },
});

module.exports = cartProducts;