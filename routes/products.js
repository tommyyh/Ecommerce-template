if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const router = express.Router();
const { Category, Product } = require('../database/associations');

// S3 Client
const s3 = new aws.S3({
  region: 'eu-central-1',
});

// Upload to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, callback) => {
      callback(null, { fieldName: file.fieldname });
    },
    key: (req, file, callback) => {
      callback(null, file.originalname);
    },
    acl: 'public-read', // Everyone can read
  }),
});

// Home
router.get('/category/:title', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.title, {
      include: Product,
    });

    res.render('products/products.html', {
      category,
    });
  } catch {
    res.redirect('/');
  }
});

// Show product
router.get('/show/:slug', async (req, res) => {
  const product = await Product.findOne({ where: { slug: req.params.slug } });

  res.render('products/show.html', {
    product
  });
});

// New
router.get('/new', async (req, res) => {
  const categories = await Category.findAll();

  res.render('products/new.html', {
    categories: categories,
  });
});

// Add a product
router.post('/new', upload.single('productImage'), async (req, res) => {
  const {
    title,
    price,
    brand,
    productCategory,
    description,
    discount,
  } = req.body; // Input values

  // Image path / name / key
  const imagePath = req.file.key;

  try {
    // Add product to a database
    const product = await Product.create({
      title,
      price,
      brand,
      productCategory,
      description,
      imagePath,
      discount,
      CategoryTitle: req.body.productCategory,
    });

    res.redirect(`/products/show/${product.slug}`);
  } catch {
    res.redirect('/products/new');
  }
});

// Add new category
router.post('/category', async (req, res) => {
  try {
    const category = await Category.create({
      title: req.body.category,
    });

    res.redirect(`/products/category/${category.title}`);
  } catch {
    res.redirect('/products/new');
  }
});

module.exports = router;
