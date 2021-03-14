const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const router = express.Router();
const { User } = require('../database/associations');
const authenticate = require('../config/passport');

// Authenticate
authenticate(passport);

// User account
router.get('/account', notLoggedIn, async (req, res) => {
  res.render('users/users.html', {
    user: req.user,
    req: req
  });
});

// Register
router.get('/register', LoggedIn, (req, res) => {
  res.render('users/register.html');
});

router.post('/register', LoggedIn, async (req, res) => {
  try {
    const { name, email } = req.body;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.redirect('/users/login');
  } catch {
    res.render('users/register.html', {
      errorMessage: 'Error creating user'
    });
  }
});

// Login
router.get('/login', LoggedIn, (req, res) => {
  res.render('users/login.html');
});

router.post('/login', LoggedIn, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}));

// Logout
router.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

// Protect routes for not logged in only
function LoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  next();
};

// Protect routes for logged in only
function notLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
};

module.exports = router;