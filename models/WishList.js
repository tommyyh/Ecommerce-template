const { DataTypes } = require('sequelize');

const db = require('../database/database');

// Wish list model
const WishList = db.define('WishList', {
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
  totalPrice: {
    type: DataTypes.FLOAT,
  },
  slug: {
    type: DataTypes.STRING,
  },
});

module.exports = WishList;