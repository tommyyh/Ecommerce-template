const { DataTypes, INTEGER } = require('sequelize');
const SequelizeSlugify = require('sequelize-slugify');

const db = require('../database/database');

// Order items model
const OrderItems = db.define('OrderItems', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imagePath: {
    type: DataTypes.STRING,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
  },
});

module.exports = OrderItems;