const { DataTypes } = require('sequelize');

const db = require('../database/database');

// Cart model - logged in
const Cart = db.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  }
});

// Cart model - not logged in
class AnonymousCart {
  constructor(cart) {
    this.totalPrice = cart.totalPrice || 0;
    this.price = cart.price || 0;
    this.discount = cart.discount || 0;
    this.listOfProducts = cart.listOfProducts || [];
  }

  // Add product to the session
  addProduct(product, productQuantity) {
    let storedProduct = this.listOfProducts.find(cartProduct => cartProduct.product.id == product.id);

    if (!storedProduct) { // Check if already exists
      storedProduct = {
        product: product,
        quantity: productQuantity,
        price: product.totalPrice * productQuantity
      }

      this.listOfProducts.push(storedProduct);
    } else {
      // Update stored item price
      storedProduct.quantity = +storedProduct.quantity + +productQuantity
      storedProduct.price = storedProduct.quantity * product.totalPrice
    }

    // Update totalPrice & discount price
    this.price = this.price += product.totalPrice * productQuantity;
    this.totalPrice = this.price - (this.price / 100 * this.discount);
  }

  updateQuantity(product, updatedQuantity) { // Update quantity from cart input
    let storedProduct = this.listOfProducts.find(cartProduct => cartProduct.product.id == product.id);

    // Update cart price
    this.price += product.totalPrice * (updatedQuantity - storedProduct.quantity);

    // Update cart total price
    this.totalPrice = this.price - (this.price / 100 * this.discount);

    // Update product quantity
    storedProduct.quantity = updatedQuantity;

    // Update product price
    storedProduct.price = storedProduct.quantity * product.totalPrice
  }

  deleteFromCart(product) {
    const storedProduct = this.listOfProducts.find(cartProduct => cartProduct.product.id == product.id);
    const productIndex = this.listOfProducts.indexOf(storedProduct); // Get the index of the product

    // Remove product from listOfProducts
    this.listOfProducts.splice(productIndex);

    // Update price
    this.price = this.price - (storedProduct.price * storedProduct.quantity);

    // Update total price
    this.totalPrice = this.price - (this.price / 100 * this.discount)
  }
};

module.exports = {
  Cart,
  AnonymousCart
};
