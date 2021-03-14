const express = require('express');
const { Op } = require('sequelize');

const router = express.Router();
const { Product, Category } = require('../database/associations');

// Home
router.get('/', async (req, res) => {
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

  res.render('index.html', {
    newestProducts,
    req: req,
    categories,
    searchedProducts
  });
});

module.exports = router;
