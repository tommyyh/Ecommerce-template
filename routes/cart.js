const express = require('express');
const { Op } = require('sequelize');

const router = express.Router();
const { Category, Product, User, Cart, CartProducts, Coupon, OrderItems, Order } = require('../database/associations');
const { AnonymousCart } = require('../models/Cart');

// Cart route
router.get('/', async (req, res) => {
  const categories = await Category.findAll();
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });

  if (req.isAuthenticated()) {
    const cart = await Cart.findOne({
      where: { UserId: req.user.id },
      include: {
        model: CartProducts
      }
    });

    res.render('cart/cart.html', {
      req,
      categories,
      searchedProducts,
      cart
    });
  } else {
    res.render('cart/cart.html', {
      req,
      categories,
      searchedProducts,
      cart: req.session.cart
    });
  }
});

// Add to cart
router.post('/add-to-cart/:slug', async (req, res) => {
  const product = await Product.findOne({ where: { slug: req.params.slug } });

  try {
    // Check if user is authenticated
    if (req.isAuthenticated()) {
      // Fetch data
      const cart = await Cart.findOne({ where: { UserId: req.user.id } });
      const user = await User.findByPk(req.user.id, { include: Cart });
      const cartProduct = await CartProducts.findOne({
        where: { CartId: user.Cart.id, slug: req.params.slug }
      });

      if (!cartProduct) { // Check if Product doesnt already exists
        await CartProducts.create({
          title: product.title,
          price: product.price,
          imagePath: product.imagePath,
          quantity: req.body.quantity,
          discount: product.discount,
          discountedPrice: product.totalPrice,
          available: product.available,
          slug: product.slug,
          CartId: user.Cart.id
        });
      } else { // If it exists - increase the product quantity
        await cartProduct.update({
          quantity: +cartProduct.quantity + +req.body.quantity // Without pluses - concatination
        });
      }

      const addedProduct = await CartProducts.findOne({
        where: { CartId: user.Cart.id, slug: req.params.slug }
      });

      // Add product total price
      await addedProduct.update({
        totalPrice: addedProduct.discountedPrice * addedProduct.quantity
      });
      // Add price to cart
      await cart.update({
        price: cart.price += addedProduct.discountedPrice * req.body.quantity
      });
      // Total price - price - disocunt
      await cart.update({
        totalPrice: cart.price - (cart.price / 100 * cart.discount)
      });

      res.redirect('/cart');
    } else {
      const product = await Product.findOne({ where: { slug: req.params.slug } });
      const cart = new AnonymousCart(req.session.cart ? req.session.cart : {});
      
      cart.addProduct(product, req.body.quantity, 0); // Add product
      req.session.cart = cart; // Save cart to session

      res.redirect('/cart');
    }
  } catch (err) {
    res.redirect(`/products/show/${product.slug}`);
    console.log(err)
  }
});

// Update quantity route
router.put('/update-quantity/:slug', async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const user = await User.findByPk(req.user.id, { include: Cart });
      const cart = await Cart.findOne({ where: { UserId: req.user.id } });
      const cartProduct = await CartProducts.findOne({
        where: { CartId: user.Cart.id, slug: req.params.slug }
      });
      
      // Add price to cart
      await cart.update({
        price: cart.price += cartProduct.discountedPrice * (req.body.cartProductQuantity - cartProduct.quantity)
      });
  
      // Total price - price - disocunt
      await cart.update({
        totalPrice: cart.price - (cart.price / 100 * cart.discount)
      });
  
      // Update product Quantity
      await cartProduct.update({
        quantity: req.body.cartProductQuantity
      });
  
      // Update the totalPrice
      await cartProduct.update({
        totalPrice: cartProduct.discountedPrice * cartProduct.quantity
      });
    } else {
      const product = await Product.findOne({ where: { slug: req.params.slug } });
      const cart = new AnonymousCart(req.session.cart);
      
      cart.updateQuantity(product, req.body.updateCartQuantity);
      req.session.cart = cart;
    }

    res.redirect('/cart');
  } catch (err) {
    res.redirect('/'); console.log(err)
  } 
});

// Remove from cart route
router.delete('/remove-item/:slug', async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const user = await User.findByPk(req.user.id, { include: Cart });
      const cart = await Cart.findOne({ where: { UserId: req.user.id } });
      const cartProduct = await CartProducts.findOne({
        where: { slug: req.params.slug, CartId: user.Cart.id }
      });
  
      // Updating price
      await cart.update({
        price: cart.price - cartProduct.totalPrice
      });

      // Remove product
      await cartProduct.destroy();
  
      // Updating total price
      await cart.update({
        totalPrice: cart.price - (cart.price / 100 * cart.discount)
      });
    } else {
      const product = await Product.findOne({ where: { slug: req.params.slug } });
      const cart = new AnonymousCart(req.session.cart);

      cart.deleteFromCart(product);
      req.session.cart = cart;
    }

    res.redirect('/cart');
  } catch (err) {
    res.redirect('/cart'); console.log(err);
  }
});

// Apply coupon code
router.post('/add-coupon', async (req, res) => {
  const coupon = await Coupon.findOne({ where: { title: req.body.coupon } });

  try {
    if (req.isAuthenticated()) {
      const cart = await Cart.findOne({ where: { UserId: req.user.id } });
      
      if (!coupon) {
        res.redirect('/cart');
      } else {
        // Add coupon
        await cart.update({
          discount: coupon.discount
        });
  
        // Calculate price - discount
        await cart.update({
          totalPrice: cart.totalPrice - (cart.totalPrice / 100 * cart.discount)
        });

        res.redirect('/cart');
      }
    } else {
      if (!coupon) {
        res.redirect('/cart');
      } else {
        const cart = new AnonymousCart(req.session.cart);

        // Add coupon
        cart.applyCoupon(coupon.discount);
        req.session.cart = cart;

        res.redirect('/cart');
      }
    }
  } catch {
    res.redirect('/');
  }
});

// Remove coupon
router.delete('/remove-coupon', async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const cart = await Cart.findOne({ where: { id: req.user.id } });
    
      // Remove coupon
      await cart.update({
        discount: 0
      });
  
      // Calculate price
      await cart.update({
        totalPrice: cart.totalPrice - (cart.totalPrice / 100 * cart.discount)
      });
    } else {
      const cart = new AnonymousCart(req.session.cart);

      // Remove coupon
      cart.removeCoupon();
      req.session.cart = cart;
    }

    res.redirect('/cart');
  } catch {
    res.redirect('/');
  }
});

module.exports = router;