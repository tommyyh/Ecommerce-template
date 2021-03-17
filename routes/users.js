if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const router = express.Router();
const { User, Category, Product, Cart } = require('../database/associations');
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

  res.render('users/users.html', {
    user: req.user,
    req: req,
    categories,
    searchedProducts
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