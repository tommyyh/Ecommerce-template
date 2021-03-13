if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { Sequelize } = require('sequelize');

const db = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASS,
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: false,
    },
  }
);

module.exports = db;
