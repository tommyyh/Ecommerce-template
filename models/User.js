const { DataTypes } = require('sequelize');

const db = require('../database/database');

// User model
const User = db.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAdmin: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 1,
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Date.now,
  },
});

module.exports = User;
