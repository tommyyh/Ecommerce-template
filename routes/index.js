const express = require('express');

const router = express.Router();
const { Product } = require('../database/associations');

// Home
router.get('/', async (req, res) => {
  const newestProducts = await Product.findAll({
    order: [[ 'createdAt', 'DESC' ]],
    limit: 6
  });

  res.render('index.html', {
    newestProducts,
    req: req
  });
});

module.exports = router;
