const express = require('express');
const { Op } = require('sequelize');

const router = express.Router();
const { Category, Product, User, Cart, CartProducts } = require('../database/associations');

// Cart route
router.get('/', async (req, res) => {
  const categories = await Category.findAll();
  const cart = await Cart.findOne({
    where: { UserId: req.user.id },
    include: {
      model: CartProducts
    }
  });
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });

  res.render('cart/cart.html', {
    req,
    categories,
    searchedProducts,
    cart
  });
});

// Add to cart
router.post('/add-to-cart/:slug', async (req, res) => {
  // Fetch data
  const cart = await Cart.findOne({ where: { id: req.user.id } });
  const product = await Product.findOne({ where: { slug: req.params.slug } });
  const user = await User.findByPk(req.user.id, { include: Cart });
  const cartProduct = await CartProducts.findOne({
    where: { CartId: user.Cart.id, slug: req.params.slug }
  });

  try {
    // Check if user is authenticated
    if (req.isAuthenticated()) {
      if (!cartProduct) { // Check if Product doesnt already exists
        await CartProducts.create({
          title: product.title,
          price: product.price,
          brand: product.brand,
          description: product.description,
          imagePath: product.imagePath,
          quantity: req.body.quantity,
          discount: product.discount,
          discountedPrice: product.totalPrice,
          timesBought: product.timesBought,
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
      res.redirect('/');
    }
  } catch (err) {
    res.redirect(`/products/show/${product.slug}`);
    console.log(err)
  }
});

// Update quantity route
router.put('/update-quantity/:slug', async (req, res) => {
  const user = await User.findByPk(req.user.id, { include: Cart });
  const cart = await Cart.findOne({ where: { id: req.user.id } });
  const cartProduct = await CartProducts.findOne({
    where: { CartId: user.Cart.id, slug: req.params.slug }
  });

  try {
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

    res.redirect('/cart');
  } catch (err) {
    res.redirect('/'); console.log(err);
  } 
});

// Remove from cart route
router.delete('/remove-item/:slug', async (req, res) => {
  const user = await User.findByPk(req.user.id, { include: Cart });
  const cart = await Cart.findOne({ where: { id: req.user.id } });
  const cartProduct = await CartProducts.findOne({
    where: { slug: req.params.slug, CartId: user.Cart.id }
  });

  try {
    // Remove product
    await cartProduct.destroy();
    // Updating price
    await cart.update({
      price: cart.price - cartProduct.totalPrice
    });
    // Updating total price
    await cart.update({
      totalPrice: cart.price - cart.price / 100 * cart.discount
    });

    res.redirect('/cart');
  } catch {
    res.redirect('/cart');
  }
});

module.exports = router;