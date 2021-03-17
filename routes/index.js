const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const router = express.Router();
const { Product, Category, User, Cart } = require('../database/associations');

// Home
router.get('/', async (req, res) => {
  const users = await User.findAll();
  const newestProducts = await Product.findAll({
    order: [[ 'createdAt', 'DESC' ]],
    limit: 6
  });
  const categories = await Category.findAll();
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });

  // First account = admin
  if (!users[0]) {
    const admin = await User.create({
      name: 'Tommy',
      email: process.env.ADMIN_EMAIL,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      isAdmin: 1
    });

    await Cart.create({
      UserId: admin.id
    });
  }

  res.render('index.html', {
    newestProducts,
    req: req,
    categories,
    searchedProducts
  });
});

module.exports = router;
