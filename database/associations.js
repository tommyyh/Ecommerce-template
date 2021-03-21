const { Cart } = require('../models/Cart');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const CartProducts = require('../models/CartProducts');
const OrderItems = require('../models/OrderItems');
const WishList = require('../models/WishList');

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

// Order + order items
Order.hasMany(OrderItems);
OrderItems.belongsTo(Order);

// Cart products + cart
Cart.hasMany(CartProducts, { onDelete: 'CASCADE' });
CartProducts.belongsTo(Cart);

// WishList + User
User.hasMany(WishList);
WishList.belongsTo(User);

// Create table
Cart.sync();
Category.sync();
Order.sync();
Product.sync();
Review.sync();
User.sync();
Coupon.sync();
CartProducts.sync();
OrderItems.sync();
WishList.sync();

module.exports = {
  Cart,
  Category,
  Order,
  Product,
  Review,
  User,
  Coupon,
  CartProducts,
  OrderItems,
  WishList
};
