const Cart = require('../models/Cart');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');

// User + Cart
User.hasOne(Cart);
Cart.belongsTo(User);

// Category + Product
Category.hasMany(Product, { onDelete: 'CASCADE' });
Product.belongsTo(Category);

// User + Review
User.hasMany(Review);
Review.belongsTo(User);

// User + Order
User.hasMany(Order);
Order.belongsTo(User);

// Create table
Cart.sync();
Category.sync();
Order.sync();
Product.sync();
Review.sync();
User.sync();

module.exports = {
  Cart,
  Category,
  Order,
  Product,
  Review,
  User,
};