if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const router = express.Router();
const { User, Category, Product, Cart, Order, OrderItems, WishList } = require('../database/associations');
const authenticate = require('../config/passport');

// Authenticate
authenticate(passport);

// User account
router.get('/account', loggedIn, async (req, res) => {
  const categories = await Category.findAll();
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });
  const orders = await Order.findAll({
    where: { UserId: req.user.id },
    order: [[ 'createdAt', 'DESC' ]]
  });

  res.render('users/users.html', {
    user: req.user,
    req: req,
    categories,
    searchedProducts,
    orders
  });
});

// Register
router.get('/register', notLoggedIn, async (req, res) => {
  const categories = await Category.findAll();

  res.render('users/register.html', {
    req: req,
    categories
  });
});

router.post('/register', notLoggedIn, async (req, res) => {
  try {
    const { name, email } = req.body;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    await Cart.create({
      UserId: user.id
    });

    res.redirect('/users/login');
  } catch {
    res.render('users/register.html', {
      errorMessage: 'Error creating user'
    });
  }
});

// Login
router.get('/login', notLoggedIn, async (req, res) => {
  const categories = await Category.findAll();

  res.render('users/login.html', {
    req: req,
    categories
  });
});

router.post('/login', notLoggedIn, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}));

// Logout
router.delete('/logout', loggedIn, (req, res) => {
  req.logOut();
  res.redirect('/');
});

// My orders
router.get('/my-orders/:id', async (req, res) => {
  const order = await Order.findOne({
    where: { id: req.params.id },
    include: OrderItems
  });
  const categories = await Category.findAll();
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });

  res.render('users/orders.html', {
    order,
    searchedProducts,
    categories,
    req: req
  })
});

router.get('/my-wish-list', loggedIn, async (req, res) => {
  const categories = await Category.findAll();
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });
  const wishListProducts = await WishList.findAll({ where: { UserId: req.user.id } });

  res.render('users/wishList.html', {
    searchedProducts,
    categories,
    req: req,
    wishListProducts
  })
});

// Protect routes for not logged in only
function notLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  next();
};

// Protect routes for logged in only
function loggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
};

module.exports = router;