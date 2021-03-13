const express = require('express');
const ejs = require('ejs');

const app = express();

// Ejs
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);
app.use(express.static('public'));

// Parse data
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Routes
app.use('/', require('./routes/index')); // Home routes
app.use('/products', require('./routes/products')); // Product routes

// Port
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Port: ${port}`));
