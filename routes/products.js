if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const slugify = require('slugify');
const { Op } = require('sequelize');

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
      include: {
        model: Product
      },
    });
    const categories = await Category.findAll();
    const searchedProducts = await Product.findAll({
      where: {
        title: { [Op.like]: '%' + req.query.searchField + '%' }
      }
    });

    res.render('products/products.html', {
      category,
      req: req,
      categories,
      searchedProducts
    });
  } catch (err) {
    res.redirect('/'); console.log(err);
  }
});

// Show product
router.get('/show/:slug', async (req, res) => {
  const product = await Product.findOne({
    where: { slug: req.params.slug },
  });
  const categories = await Category.findAll();
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });

  res.render('products/show.html', {
    product,
    req: req,
    categories,
    searchedProducts
  });
});

// New
router.get('/new', isAdmin, async (req, res) => {
  const categories = await Category.findAll();
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });

  res.render('products/new.html', {
    categories: categories,
    req: req,
    searchedProducts
  });
});

// Add a product
router.post(
  '/new',
  upload.single('productImage'),
  isAdmin,
  async (req, res) => {
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
  }
);

// Edit a product
router.get('/edit/:slug', isAdmin, async (req, res) => {
  const categories = await Category.findAll();
  const product = await Product.findOne({ where: { slug: req.params.slug } });
  const searchedProducts = await Product.findAll({
    where: {
      title: { [Op.like]: '%' + req.query.searchField + '%' }
    }
  });

  res.render('products/edit.html', {
    categories,
    product,
    req: req,
    searchedProducts
  });
});

router.put(
  '/edit/:slug',
  upload.single('productImage'),
  isAdmin,
  async (req, res) => {
    const product = await Product.findOne({ where: { slug: req.params.slug } });
    const slug = slugify(req.body.title, { strict: true, lower: true });
    const {
      title,
      price,
      brand,
      productCategory,
      description,
      discount,
    } = req.body; // Input values

    // Image path / name / key
    const imagePath = req.file ? req.file.key : product.imagePath;

    try {
      // If an img was uploaded - delete old, add new
      if (req.file) {
        await s3.deleteObject(
          {
            Bucket: 'ecommerce-template-tommy',
            Key: product.imagePath,
          },
          (err, data) => {
            if (err) console.log(err);
          }
        );
      }

      // Add product to a database
      await Product.update(
        {
          title,
          price,
          brand,
          productCategory,
          description,
          imagePath,
          discount,
          CategoryTitle: req.body.productCategory,
          slug: slug,
          createdAt: product.createdAt,
        },
        { where: { slug: req.params.slug } }
      );

      res.redirect(`/products/show/${product.slug}`);
    } catch {
      res.redirect(`/products/edit/${product.slug}`);
    }
  }
);

// Delete product
router.delete('/delete/:slug', isAdmin, async (req, res) => {
  const product = await Product.findOne({ where: { slug: req.params.slug } });

  try {
    await product.destroy();
    await s3.deleteObject(
      {
        Bucket: 'ecommerce-template-tommy',
        Key: product.imagePath,
      },
      (err, data) => {
        if (err) console.log(err);
      }
    );

    res.redirect(`/products/category/${product.CategoryTitle}`);
  } catch {
    res.redirect(`/products/show/${product.slug}`);
  }
});

// Add new category
router.post('/category', isAdmin, async (req, res) => {
  try {
    const category = await Category.create({
      title: req.body.category,
    });

    res.redirect(`/products/category/${category.title}`);
  } catch {
    res.redirect('/products/new');
  }
});

router.delete('/category/delete/:title', isAdmin, async (req, res) => {
  const category = await Category.findByPk(req.params.title, {
    include: Product,
  });

  try {
    await category.Products.forEach((product) => {
      s3.deleteObject(
        {
          Bucket: 'ecommerce-template-tommy',
          Key: product.imagePath,
        },
        (err, data) => {
          if (err) console.log(err);
        }
      );
    });
    await category.destroy();

    res.redirect('/');
  } catch (err) {
    res.redirect(`/products/category/${category.title}`);
    console.log(err);
  }
});

// Protect routes for logged in only
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin == 1) {
    return next();
  }

  res.redirect('/');
}

module.exports = router;
