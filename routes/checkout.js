if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const { Op } = require('sequelize');
const stripe = require('stripe')(process.env.STRIPE_SK);

const router = express.Router();
const { Category, Product, User, Order, Cart, CartProducts, OrderItems } = require('../database/associations');

// Checkout
router.get('/shipping-information', checkoutAccess, async (req, res) => {
  const categories = await Category.findAll();
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });
  
  if (req.isAuthenticated()) {
    const user = await User.findOne({ where: { id: req.user.id } });

    res.render('checkout/checkout.html', {
      req: req,
      categories,
      searchedProducts,
      user
    });
  } else {
    res.render('checkout/checkout.html', {
      req: req,
      categories,
      searchedProducts
    });
  }
});

// User information post route
router.post('/shipping-information', async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const cart = await Cart.findOne({ where: { UserId: req.user.id } });
      const {
        addressLine1,
        addressLine2,
        phoneNumber,
        email,
        zipCode,
        name,
        companyName,
        country,
        city
      } = req.body;
    
      const shippingInformation = {
        price: cart.totalPrice,
        addressLine1,
        addressLine2,
        phone: phoneNumber,
        email,
        zipCode,
        name,
        companyName,
        country,
        city,
        discount: cart.discount,
        UserId: req.user.id
      };

      // Store info in session - if payment fails / brower closes - doesnt save info
      req.session.shippingInformation = shippingInformation;
      req.session.cookie.expires = false;
      res.redirect('/checkout/payment');
    }
  } catch {
    res.redirect('/checkout/shipping-information');
  }
});

// Checkout payment
router.get('/payment', async (req, res) => {
  const categories = await Category.findAll();
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });
  const cart = await Cart.findOne({
    where: { UserId: req.user.id },
    include: CartProducts
  });

  res.render('checkout/payment.html', {
    req: req,
    categories,
    searchedProducts,
    cart
  });
});

// Pay
router.post('/create-payment', async (req, res) => {
  const cart = await Cart.findOne({ where: { UserId: req.user.id } });
  const amount = cart.totalPrice * 100;

  // Create a PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

router.get('/success', async (req, res) => {
  const categories = await Category.findAll();
  const order = req.session.shippingInformation;
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });
  const cart = await Cart.findOne({
    where: { UserId: req.user.id },
    include: CartProducts
  });

  // If success page renders -> save order
  const newOrder = await Order.create({
    price: order.price,
    addressLine1: order.addressLine1,
    addressLine2: order.addressLine2,
    phone: order.phone,
    email: order.email,
    zipCode: order.zipCode,
    name: order.name,
    companyName: order.companyName,
    country: order.country,
    city: order.city,
    discount: order.discount,
    UserId: order.UserId
  });

  // Add bought products
  cart.cartProducts.forEach(async cartProduct => {
    await OrderItems.create({
      title: cartProduct.title,
      imagePath: cartProduct.imagePath,
      quantity: cartProduct.quantity,
      totalPrice: cartProduct.discountedPrice,
      slug: cartProduct.slug,
      OrderId: newOrder.id,
    });
  });

  // Clear cart
  await cart.destroy();

  // Create a new cart
  await Cart.create({
    UserId: req.user.id
  });

  res.render('checkout/success.html', {
    req: req,
    categories,
    searchedProducts
  });
});

async function checkoutAccess(req, res, next) {
  const cart = await Cart.findOne({
    where: { UserId: req.user.id },
    include: CartProducts
  });

  if (!cart.cartProducts[0]) {
    return res.redirect('/');
  }

  next();
}

module.exports = router;