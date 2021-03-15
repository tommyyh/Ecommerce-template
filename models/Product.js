const { DataTypes, INTEGER } = require('sequelize');
const SequelizeSlugify = require('sequelize-slugify');

const db = require('../database/database');

// Product model
const Product = db.define('Product', {
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
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
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
  available: {
    type: DataTypes.TINYINT,
    validate: {
      min: 0,
      max: 1,
    },
    defaultValue: 1,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Date.now,
  },
  timesBought: {
    type: INTEGER,
    defaultValue: 0
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
  },
});

// Slugify title
SequelizeSlugify.slugifyModel(Product, {
  source: ['title'],
  slugOptions: { lower: true, strict: true },
  column: 'slug',
  incrementalSeparator: '-',
});

module.exports = Product;
