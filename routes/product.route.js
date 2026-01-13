const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct
} = require('../controllers/product.controller');

// GET all products
router.get('/', getAllProducts);

// GET single product
router.get('/:id', getProductById);

// CREATE product
router.post('/', createProduct);

module.exports = router;
