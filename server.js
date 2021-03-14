if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const ejs = require('ejs');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');

const app = express();

// Ejs
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);
app.use(express.static('public'));

// Parse data
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Session, flash
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 999 * 999 * 999 * 999 * 1000
  }
}));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Method override
app.use(methodOverride('_method'));

// Routes
app.use('/', require('./routes/index')); // Home routes
app.use('/products', require('./routes/products')); // Product routes
app.use('/users', require('./routes/users')); // User routes

// Port
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Port: ${port}`));
